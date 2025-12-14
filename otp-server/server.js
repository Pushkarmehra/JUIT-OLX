const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'otp-server' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ],
});

// In-memory storage for OTPs (use Redis or database in production)
const otpStore = new Map();
const attemptStore = new Map();

// Email transporter setup
let emailTransporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    emailTransporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Twilio client setup
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Middleware
app.use(helmet({
    contentSecurityPolicy: false // Allow for development
}));

app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ error: message });
        }
    });
};

// General rate limit
app.use(createRateLimit(
    parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || 15) * 60 * 1000,
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 10),
    'Too many requests from this IP, please try again later'
));

// Specific rate limits for OTP endpoints
const otpRequestLimit = createRateLimit(
    5 * 60 * 1000, // 5 minutes
    3, // 3 OTP requests per 5 minutes
    'Too many OTP requests, please wait before requesting again'
);

const otpVerifyLimit = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 verification attempts per 15 minutes
    'Too many verification attempts, please wait before trying again'
);

// Utility functions
const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }
    return otp;
};

const hashOTP = (otp) => {
    return bcrypt.hashSync(otp, parseInt(process.env.SALT_ROUNDS || 12));
};

const verifyOTP = (otp, hash) => {
    return bcrypt.compareSync(otp, hash);
};

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@juitsolan\.in$/;
    return emailRegex.test(email);
};

const validatePhone = (phone) => {
    const phoneRegex = /^(\+91|91)?[6-9][0-9]{9}$/;
    return phoneRegex.test(phone);
};

const normalizePhone = (phone) => {
    // Remove +91 or 91 prefix and ensure it starts with country code
    let normalized = phone.replace(/^\+?91/, '');
    if (normalized.length === 10) {
        return '+91' + normalized;
    }
    return null;
};

const cleanupExpiredOTPs = () => {
    const now = moment();
    for (const [key, data] of otpStore.entries()) {
        if (now.isAfter(moment(data.expiryTime))) {
            otpStore.delete(key);
            attemptStore.delete(key);
        }
    }
};

// Cleanup expired OTPs every minute
setInterval(cleanupExpiredOTPs, 60 * 1000);

// Validation middleware
const validateOTPRequest = [
    body('email')
        .optional()
        .isEmail()
        .custom((value) => {
            if (value && !validateEmail(value)) {
                throw new Error('Only JUIT email addresses (@juitsolan.in) are allowed');
            }
            return true;
        }),
    body('phone')
        .optional()
        .custom((value) => {
            if (value && !validatePhone(value)) {
                throw new Error('Invalid phone number format');
            }
            return true;
        }),
    body('type')
        .isIn(['email', 'sms'])
        .withMessage('Type must be either "email" or "sms"'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        // Ensure either email or phone is provided based on type
        if (req.body.type === 'email' && !req.body.email) {
            return res.status(400).json({ error: 'Email is required for email OTP' });
        }
        if (req.body.type === 'sms' && !req.body.phone) {
            return res.status(400).json({ error: 'Phone number is required for SMS OTP' });
        }

        next();
    }
];

const validateOTPVerification = [
    body('identifier')
        .notEmpty()
        .withMessage('Identifier (email or phone) is required'),
    body('otp')
        .isLength({ min: 4, max: 8 })
        .isNumeric()
        .withMessage('OTP must be 4-8 digits'),
    body('sessionId')
        .isUUID()
        .withMessage('Valid session ID is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }
        next();
    }
];

// Routes
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/api/otp/config', (req, res) => {
    res.json({
        emailEnabled: !!emailTransporter,
        smsEnabled: !!twilioClient,
        otpLength: parseInt(process.env.OTP_LENGTH || 6),
        expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || 5),
        maxAttempts: parseInt(process.env.MAX_OTP_ATTEMPTS || 3)
    });
});

app.post('/api/otp/request', otpRequestLimit, validateOTPRequest, async (req, res) => {
    try {
        const { email, phone, type } = req.body;
        const identifier = type === 'email' ? email : normalizePhone(phone);

        if (!identifier) {
            return res.status(400).json({ error: 'Invalid identifier format' });
        }

        // Check if services are available
        if (type === 'email' && !emailTransporter) {
            return res.status(503).json({ error: 'Email service is not configured' });
        }
        if (type === 'sms' && !twilioClient) {
            return res.status(503).json({ error: 'SMS service is not configured' });
        }

        // Generate OTP and session ID
        const otp = generateOTP(parseInt(process.env.OTP_LENGTH || 6));
        const sessionId = uuidv4();
        const expiryTime = moment().add(parseInt(process.env.OTP_EXPIRY_MINUTES || 5), 'minutes');

        // Store OTP data
        const otpData = {
            hashedOTP: hashOTP(otp),
            expiryTime: expiryTime.toISOString(),
            type,
            identifier,
            attempts: 0,
            created: moment().toISOString()
        };

        otpStore.set(sessionId, otpData);
        attemptStore.set(identifier, (attemptStore.get(identifier) || 0) + 1);

        // Send OTP
        if (type === 'email') {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'JUIT OLX'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: identifier,
                subject: 'JUIT OLX - Email Verification Code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">JUIT OLX</h1>
                            <p style="color: #f0f8ff; margin: 5px 0;">Campus Marketplace</p>
                        </div>
                        <div style="padding: 30px; background: #f8f9fa;">
                            <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
                            <p style="color: #666; margin-bottom: 20px;">Please use the following verification code to complete your authentication:</p>
                            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #667eea;">
                                <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
                            </div>
                            <p style="color: #666; margin-top: 20px; font-size: 14px;">
                                This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.<br>
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                        <div style="background: #333; padding: 15px; text-align: center;">
                            <p style="color: #999; margin: 0; font-size: 12px;">© 2024 JUIT OLX - Campus Marketplace</p>
                        </div>
                    </div>
                `
            };

            await emailTransporter.sendMail(mailOptions);
        } else if (type === 'sms') {
            const message = `JUIT OLX verification code: ${otp}. This code expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code with anyone.`;
            
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: identifier
            });
        }

        logger.info(`OTP requested for ${identifier} via ${type}`, {
            sessionId,
            identifier: identifier.replace(/(.{3}).*(.{3})/, '$1***$2'), // Mask identifier in logs
            type
        });

        res.json({
            success: true,
            message: `OTP sent to your ${type === 'email' ? 'email' : 'phone number'}`,
            sessionId,
            expiryTime: expiryTime.toISOString(),
            canResendAt: moment().add(1, 'minute').toISOString() // 1 minute cooldown
        });

    } catch (error) {
        logger.error('OTP request failed', {
            error: error.message,
            stack: error.stack,
            body: req.body
        });

        res.status(500).json({
            error: 'Failed to send OTP',
            message: 'Please try again later'
        });
    }
});

app.post('/api/otp/verify', otpVerifyLimit, validateOTPVerification, async (req, res) => {
    try {
        const { identifier, otp, sessionId } = req.body;

        // Check if OTP session exists
        if (!otpStore.has(sessionId)) {
            return res.status(400).json({
                error: 'Invalid or expired session',
                code: 'SESSION_NOT_FOUND'
            });
        }

        const otpData = otpStore.get(sessionId);

        // Check if OTP has expired
        if (moment().isAfter(moment(otpData.expiryTime))) {
            otpStore.delete(sessionId);
            return res.status(400).json({
                error: 'OTP has expired',
                code: 'OTP_EXPIRED'
            });
        }

        // Check if too many attempts
        if (otpData.attempts >= parseInt(process.env.MAX_OTP_ATTEMPTS || 3)) {
            otpStore.delete(sessionId);
            return res.status(400).json({
                error: 'Maximum verification attempts exceeded',
                code: 'MAX_ATTEMPTS_EXCEEDED'
            });
        }

        // Check if identifier matches
        if (otpData.identifier !== identifier && 
            otpData.identifier !== normalizePhone(identifier)) {
            return res.status(400).json({
                error: 'Identifier mismatch',
                code: 'IDENTIFIER_MISMATCH'
            });
        }

        // Increment attempt count
        otpData.attempts++;
        otpStore.set(sessionId, otpData);

        // Verify OTP
        if (!verifyOTP(otp, otpData.hashedOTP)) {
            const remainingAttempts = parseInt(process.env.MAX_OTP_ATTEMPTS || 3) - otpData.attempts;
            
            logger.warn(`Invalid OTP attempt for ${identifier}`, {
                sessionId,
                attemptNumber: otpData.attempts,
                remainingAttempts
            });

            return res.status(400).json({
                error: 'Invalid OTP',
                code: 'INVALID_OTP',
                remainingAttempts
            });
        }

        // OTP is valid - clean up and return success
        otpStore.delete(sessionId);
        attemptStore.delete(identifier);

        logger.info(`OTP verified successfully for ${identifier}`, {
            sessionId,
            type: otpData.type
        });

        res.json({
            success: true,
            message: 'OTP verified successfully',
            verifiedAt: new Date().toISOString(),
            type: otpData.type,
            identifier: otpData.identifier
        });

    } catch (error) {
        logger.error('OTP verification failed', {
            error: error.message,
            stack: error.stack,
            sessionId: req.body.sessionId
        });

        res.status(500).json({
            error: 'Verification failed',
            message: 'Please try again later'
        });
    }
});

app.post('/api/otp/resend', otpRequestLimit, async (req, res) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId || !otpStore.has(sessionId)) {
            return res.status(400).json({
                error: 'Invalid session ID',
                code: 'SESSION_NOT_FOUND'
            });
        }

        const otpData = otpStore.get(sessionId);
        
        // Check if it's too soon to resend
        const timeSinceCreated = moment().diff(moment(otpData.created), 'seconds');
        if (timeSinceCreated < 60) { // 1 minute cooldown
            return res.status(429).json({
                error: 'Please wait before requesting another OTP',
                waitTime: 60 - timeSinceCreated
            });
        }

        // Generate new OTP
        const otp = generateOTP(parseInt(process.env.OTP_LENGTH || 6));
        const newExpiryTime = moment().add(parseInt(process.env.OTP_EXPIRY_MINUTES || 5), 'minutes');

        // Update stored data
        otpData.hashedOTP = hashOTP(otp);
        otpData.expiryTime = newExpiryTime.toISOString();
        otpData.attempts = 0;
        otpData.created = moment().toISOString();
        otpStore.set(sessionId, otpData);

        // Resend OTP using the same method as original request
        if (otpData.type === 'email') {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'JUIT OLX'}" <${process.env.EMAIL_FROM_ADDRESS}>`,
                to: otpData.identifier,
                subject: 'JUIT OLX - Email Verification Code (Resent)',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
                            <h1 style="color: white; margin: 0;">JUIT OLX</h1>
                            <p style="color: #f0f8ff; margin: 5px 0;">Campus Marketplace</p>
                        </div>
                        <div style="padding: 30px; background: #f8f9fa;">
                            <h2 style="color: #333; margin-bottom: 20px;">Email Verification (Resent)</h2>
                            <p style="color: #666; margin-bottom: 20px;">Here's your new verification code:</p>
                            <div style="background: #fff; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid #667eea;">
                                <h1 style="color: #667eea; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
                            </div>
                            <p style="color: #666; margin-top: 20px; font-size: 14px;">
                                This code will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.<br>
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                        <div style="background: #333; padding: 15px; text-align: center;">
                            <p style="color: #999; margin: 0; font-size: 12px;">© 2024 JUIT OLX - Campus Marketplace</p>
                        </div>
                    </div>
                `
            };

            await emailTransporter.sendMail(mailOptions);
        } else if (otpData.type === 'sms') {
            const message = `JUIT OLX verification code (resent): ${otp}. This code expires in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes. Do not share this code.`;
            
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: otpData.identifier
            });
        }

        logger.info(`OTP resent for ${otpData.identifier}`, {
            sessionId,
            type: otpData.type
        });

        res.json({
            success: true,
            message: 'OTP resent successfully',
            expiryTime: newExpiryTime.toISOString(),
            canResendAt: moment().add(1, 'minute').toISOString()
        });

    } catch (error) {
        logger.error('OTP resend failed', {
            error: error.message,
            stack: error.stack,
            sessionId: req.body.sessionId
        });

        res.status(500).json({
            error: 'Failed to resend OTP',
            message: 'Please try again later'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    logger.info(`OTP Server running on port ${PORT}`, {
        environment: process.env.NODE_ENV || 'development',
        emailEnabled: !!emailTransporter,
        smsEnabled: !!twilioClient
    });
});

module.exports = app;
