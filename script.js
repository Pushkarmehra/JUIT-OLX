tailwind.config = {
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f9ff',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    900: '#1e3a8a'
                },
                dark: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a'
                }
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
                'slide-in': 'slideIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s infinite',
                'bounce-slow': 'bounce 2s infinite',
                'shake': 'shake 0.5s ease-in-out',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'float': 'float 3s ease-in-out infinite',
                'rotate-slow': 'rotateSlow 8s linear infinite',
                'scale-pulse': 'scalePulse 2s ease-in-out infinite'
            },
            keyframes: {
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(30px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' }
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                slideIn: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' }
                },
                shake: {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
                    '20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
                },
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' }
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                rotateSlow: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' }
                },
                scalePulse: {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' }
                }
            }
        }
    }
}

class JUITOLXApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.filteredProducts = [];
        this.categories = [
            { id: 'books', name: 'Books & Notes', color: 'bg-green-600', icon: 'fas fa-book' },
            { id: 'electronics', name: 'Electronics', color: 'bg-blue-600', icon: 'fas fa-laptop' },
            { id: 'furniture', name: 'Furniture', color: 'bg-orange-600', icon: 'fas fa-couch' },
            { id: 'clothing', name: 'Clothing', color: 'bg-purple-600', icon: 'fas fa-tshirt' },
            { id: 'sports', name: 'Sports & Fitness', color: 'bg-red-600', icon: 'fas fa-dumbbell' },
            { id: 'vehicles', name: 'Vehicles', color: 'bg-yellow-600', icon: 'fas fa-car' },
            { id: 'tools', name: 'Tools & Equipment', color: 'bg-gray-600', icon: 'fas fa-tools' },
            { id: 'other', name: 'Other', color: 'bg-indigo-600', icon: 'fas fa-box' }
        ];
        this.activeFilters = {
            category: null,
            search: ''
        };
        this.selectedImage = null;
        
        // API endpoint for secure server-side operations
        this.apiEndpoint = '/api/github';

        // Key material will be fetched from server when needed for legacy password verification
        this._keyMaterial = null;
        this._keyMaterialPromise = null;

        this.dataConfig = {
            owner: 'Pushkaridc',
            repo: 'JUIT-DATA-STORE',
            branch: 'main'
        };


        this.mediaConfig = {
            owner: 'Pushkaridc',
            repo: 'juit-olx-media',
            branch: 'main'
        };

        this.emailJSConfig = {
            serviceId: 'service_bm57124',
            templateId: 'template_k0tkxvf',
            userId: '2N7Ajf083iUCh25DC'
        };

        this.otpConfig = {
            length: 6,
            expiryMinutes: 15,
            maxAttempts: 3,
            resendDelaySeconds: 30,
            testMode: false
        };

        // In-memory OTP storage and sending flag
        this.otpSessions = new Map();
        this.otpSending = false;
        
        this.init();
    }

    async init() {
        this.initializeEmailJS();
        this.checkAuthentication();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupImageUpload();
        this.loadCategories();
        await this.loadProducts();
    }

    initializeEmailJS() {
        if (typeof emailjs !== 'undefined') {
            try {
                emailjs.init(this.emailJSConfig.userId);
                return true;
            } catch (error) {
                return false;
            }
        }
        return false;
    }

    checkAuthentication() {
        const storedUser = JSON.parse(sessionStorage.getItem('juitUser') || 'null');
        if (storedUser && this.validateJUITEmail(storedUser.email)) {
            this.currentUser = storedUser;
            this.hideAuthModal();
            this.updateUserGreeting();
        } else {
            this.showAuthModal();
        }
    }

    validateJUITEmail(email) {
        return email && email.endsWith('@juitsolan.in');
    }

    showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    showLoginForm() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('otpVerificationForm').classList.add('hidden');
        
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
    }

    showSignupForm() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        document.getElementById('otpVerificationForm').classList.add('hidden');
        
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
    }

    showForgotPassword() {
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.remove('hidden');
        document.getElementById('otpVerificationForm').classList.add('hidden');
        
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const passwordIcon = document.getElementById('passwordIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    }

    toggleSignupPassword() {
        const passwordInput = document.getElementById('signupPassword');
        const passwordIcon = document.getElementById('signupPasswordIcon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.classList.remove('fa-eye');
            passwordIcon.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            passwordIcon.classList.remove('fa-eye-slash');
            passwordIcon.classList.add('fa-eye');
        }
    }

    updatePasswordStrength(password) {
        const strengthEl = document.getElementById('signupPasswordStrength');
        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        strengthEl.className = 'password-strength mt-2';
        if (strength === 1) strengthEl.classList.add('strength-weak');
        else if (strength === 2) strengthEl.classList.add('strength-medium');
        else if (strength === 3) strengthEl.classList.add('strength-strong');
        else if (strength === 4) strengthEl.classList.add('strength-very-strong');
    }

    updateUserGreeting() {
        if (this.currentUser) {
            const firstName = this.currentUser.name.split(' ')[0];
            document.getElementById('userGreeting').textContent = `Hello, ${firstName}!`;
            document.getElementById('userGreeting').classList.remove('hidden');
        }
    }

    setupEventListeners() {
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegistration();
        });

        document.getElementById('signupPassword').addEventListener('input', (e) => {
            this.updatePasswordStrength(e.target.value);
        });

        // WhatsApp input validation
        document.getElementById('whatsappAuth').addEventListener('input', (e) => {
            // Remove any non-digits
            e.target.value = e.target.value.replace(/\D/g, '');
            
            // Limit to 10 digits
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });

        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch();
            }, 300);
        });

        document.getElementById('sellForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });

        ['sellModal'].forEach(modalId => {
            document.getElementById(modalId).addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    this.closeModal(modalId);
                }
            });
        });
    }

    async handleLogin() {
        const email = document.getElementById('juitEmail').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!this.validateJUITEmail(email)) {
            this.showNotification('Please use your JUIT email address (@juitsolan.in)', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            // Use server-side password verification
            const response = await fetch(`${this.apiEndpoint}?action=verifyPassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.error === 'User not found' || (!result.valid && !result.legacy)) {
                this.showNotification('Account not found or invalid password. Please check your credentials.', 'error');
                return;
            }

            let userData = result.user;

            // Handle legacy CryptoJS encrypted passwords
            if (result.legacy && result.encryptedPassword) {
                const keyMaterial = await this.getKeyMaterial();
                if (keyMaterial) {
                    try {
                        const decryptedPassword = CryptoJS.AES.decrypt(result.encryptedPassword, keyMaterial).toString(CryptoJS.enc.Utf8);
                        if (decryptedPassword !== password) {
                            this.showNotification('Invalid password. Please try again.', 'error');
                            return;
                        }
                    } catch (e) {
                        this.showNotification('Error verifying password. Please try again.', 'error');
                        return;
                    }
                } else {
                    this.showNotification('Unable to verify credentials. Please try again.', 'error');
                    return;
                }
            } else if (!result.valid) {
                this.showNotification('Invalid password. Please try again.', 'error');
                return;
            }

            // Check if user account was created with OTP verification
            if (!userData.otpVerified) {
                this.showNotification('Account not verified. Please contact support or create a new account.', 'error');
                return;
            }

            this.currentUser = {
                email: userData.email,
                name: userData.name,
                whatsapp: userData.whatsapp,
                otpVerified: userData.otpVerified
            };

            sessionStorage.setItem('juitUser', JSON.stringify(this.currentUser));
            this.hideAuthModal();
            this.updateUserGreeting();
            this.showNotification(`Welcome back, ${this.currentUser.name.split(' ')[0]}!`, 'success');
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async getKeyMaterial() {
        // Cache the key material promise to avoid multiple requests
        if (this._keyMaterial) {
            return this._keyMaterial;
        }
        if (this._keyMaterialPromise) {
            return this._keyMaterialPromise;
        }

        this._keyMaterialPromise = (async () => {
            try {
                const response = await fetch(`${this.apiEndpoint}?action=getKeyMaterial`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                const data = await response.json();
                if (data.keyMaterial) {
                    this._keyMaterial = data.keyMaterial;
                    return this._keyMaterial;
                }
            } catch (error) {
                console.error('Error getting key material:', error);
            }
            return '';
        })();

        return this._keyMaterialPromise;
    }

    async getUserFromGitHub(email) {
        try {
            const response = await fetch(`${this.apiEndpoint}?action=getUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            return data.user || null;
        } catch (error) {
            console.error('Error getting user from GitHub:', error);
            return null;
        }
    }

    async saveUserToGitHub(userData) {
        try {
            const response = await fetch(`${this.apiEndpoint}?action=saveUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userData })
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving user to GitHub:', error);
            return false;
        }
    }

    // OTP Verification Methods
    async handleRegistration() {
        // Prevent multiple simultaneous registrations
        if (this.registrationInProgress) {
            this.showNotification('Registration already in progress...', 'warning');
            return;
        }

        const email = document.getElementById('signupEmail').value.trim();
        const name = document.getElementById('fullName').value.trim();
        const whatsapp = document.getElementById('whatsappAuth').value.trim();
        const password = document.getElementById('signupPassword').value.trim();

        if (!this.validateJUITEmail(email)) {
            this.showNotification('Please use your JUIT email address (@juitsolan.in)', 'error');
            return;
        }

        if (!/^[6-9][0-9]{9}$/.test(whatsapp)) {
            this.showNotification('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            this.registrationInProgress = true;

            const existingUser = await this.getUserFromGitHub(email);
            if (existingUser) {
                this.showNotification('Account already exists. Please login instead.', 'error');
                return;
            }

            // Store registration data for OTP verification
            this.pendingRegistration = {
                email,
                name,
                whatsapp,
                password
            };

            await this.initiateOTPVerification(email, 'email');

        } catch (error) {
            this.showNotification('Registration failed. Please try again.', 'error');
        } finally {
            this.registrationInProgress = false;
        }
    }

    async completeRegistration(email, name, whatsapp, password) {
        try {
            // Security check: Ensure this function is only called after successful OTP verification
            if (!this.pendingRegistration) {
                console.error('Security violation: completeRegistration called without pending registration');
                this.showNotification('Invalid registration attempt. Please start over.', 'error');
                return;
            }

            // Verify that the provided data matches the pending registration
            if (this.pendingRegistration.email !== email || 
                this.pendingRegistration.name !== name ||
                this.pendingRegistration.whatsapp !== whatsapp ||
                this.pendingRegistration.password !== password) {
                console.error('Security violation: Registration data mismatch');
                this.showNotification('Registration data verification failed. Please start over.', 'error');
                this.pendingRegistration = null;
                return;
            }

            const formattedWhatsapp = `91${whatsapp}`;

            // Password encryption is now handled server-side
            const success = await this.saveUserToGitHub({
                email,
                name,
                whatsapp: formattedWhatsapp,
                password: password, // Server will encrypt this
                activated: true,
                createdAt: new Date().toISOString(),
                otpVerified: true, // Always true since OTP verification is mandatory
                registrationMethod: 'otp-verified'
            });

            if (success) {
                this.showNotification('Account created successfully! You can now log in.', 'success');
                this.showLoginForm();
                document.getElementById('registerForm').reset();
                document.getElementById('signupPasswordStrength').className = 'password-strength mt-2';
                
                // Clear pending registration after successful completion
                this.pendingRegistration = null;
            } else {
                this.showNotification('Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration completion error:', error);
            this.showNotification('Registration failed. Please try again.', 'error');
        }
    }

    async initiateOTPVerification(identifier, type = 'email') {
        try {
            // Prevent multiple simultaneous OTP requests
            if (this.otpSending) {
                this.showNotification('OTP already being sent, please wait...', 'warning');
                return;
            }

            this.otpSending = true;

            if (type !== 'email') {
                this.showNotification('Only email OTP is supported', 'error');
                return;
            }

            // Generate OTP
            const otp = this.generateOTP();
            const sessionId = this.generateSessionId();
            const expiryTime = new Date(Date.now() + this.otpConfig.expiryMinutes * 60 * 1000);
            const canResendAt = new Date(Date.now() + 60 * 1000); // 1 minute cooldown

            // Store OTP session
            this.otpSessions.set(sessionId, {
                otp: otp,
                identifier: identifier,
                type: type,
                expiryTime: expiryTime,
                canResendAt: canResendAt,
                attempts: 0,
                createdAt: new Date()
            });

            // Send email via EmailJS or test mode
            if (this.otpConfig.testMode) {
                // In test mode, log OTP to console instead of sending email
                this.showNotification(`TEST MODE: Check console for OTP code (${otp})`, 'success');
                this.currentOTPSession = {
                    sessionId: sessionId,
                    identifier: identifier,
                    type: type,
                    expiryTime: expiryTime.toISOString(),
                    canResendAt: canResendAt.toISOString()
                };

                this.showOTPVerificationForm(identifier, type);
                this.startOTPTimer();
                this.showNotification(`TEST MODE: Check console for OTP code (${otp})`, 'success');
                return;
            }

            // Prepare template parameters for EmailJS
            // Using the most standard EmailJS format
            const templateParams = {
                email: identifier,

                passcode: otp,

                time: expiryTime.toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour12: true,
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };


            console.log(' Template Parameters:', templateParams);
            console.log(' IMPORTANT: Make sure your EmailJS template "To" field is set to {{to_email}}');
            
            // Send email with EmailJS
            const emailResponse = await emailjs.send(
                this.emailJSConfig.serviceId,
                this.emailJSConfig.templateId,
                templateParams,
                this.emailJSConfig.userId
            );



            if (emailResponse && (emailResponse.status === 200 || emailResponse.status === '200')) {
                this.currentOTPSession = {
                    sessionId: sessionId,
                    identifier: identifier,
                    type: type,
                    expiryTime: expiryTime.toISOString(),
                    canResendAt: canResendAt.toISOString()
                };

                this.showOTPVerificationForm(identifier, type);
                this.startOTPTimer();
                this.showNotification('Verification code sent successfully!', 'success');

            } else {
                throw new Error('Failed to send verification email');
            }
        } catch (error) {
            this.showNotification('Failed to send verification code. Please try again.', 'error');
        } finally {
            this.otpSending = false;
        }
    }

    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    generateSessionId() {
        return 'otp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    showOTPVerificationForm(identifier, type) {
        // Hide other forms
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('forgotPasswordForm').classList.add('hidden');
        
        // Show OTP form
        document.getElementById('otpVerificationForm').classList.remove('hidden');
        
        // Update instructions
        const instructions = document.getElementById('otpInstructions');
        const maskedIdentifier = type === 'email' 
            ? identifier.replace(/(.{2}).*(@.*)/, '$1***$2')
            : identifier.replace(/(.{3}).*(.{3})/, '$1***$2');
        
        instructions.textContent = `We've sent a 6-digit verification code to ${maskedIdentifier}`;
        
        // Clear previous OTP inputs
        this.clearOTPInputs();
        
        // Focus first input
        document.getElementById('otp1').focus();
        
        // Setup OTP input handlers
        this.setupOTPInputHandlers();
    }

    setupOTPInputHandlers() {
        const inputs = document.querySelectorAll('.otp-digit');
        
        inputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                
                // Only allow digits
                if (!/^\d*$/.test(value)) {
                    e.target.value = '';
                    return;
                }
                
                // Move to next input
                if (value && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
                
                // Update styling
                if (value) {
                    e.target.classList.add('filled');
                } else {
                    e.target.classList.remove('filled');
                }
                
                // Check if all inputs are filled
                this.checkOTPComplete();
            });
            
            input.addEventListener('keydown', (e) => {
                // Handle backspace
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    inputs[index - 1].focus();
                }
                
                // Handle paste
                if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    navigator.clipboard.readText().then(text => {
                        this.handleOTPPaste(text);
                    });
                }
            });
            
            input.addEventListener('focus', () => {
                input.classList.remove('error');
            });
        });
    }

    handleOTPPaste(pastedText) {
        const digits = pastedText.replace(/\D/g, '').slice(0, 6);
        const inputs = document.querySelectorAll('.otp-digit');
        
        digits.split('').forEach((digit, index) => {
            if (inputs[index]) {
                inputs[index].value = digit;
                inputs[index].classList.add('filled');
            }
        });
        
        if (digits.length === 6) {
            this.checkOTPComplete();
        }
    }

    checkOTPComplete() {
        const inputs = document.querySelectorAll('.otp-digit');
        const values = Array.from(inputs).map(input => input.value);
        const isComplete = values.every(value => value !== '');
        
        const verifyBtn = document.getElementById('verifyOtpBtn');
        if (isComplete) {
            verifyBtn.classList.remove('opacity-50');
            verifyBtn.disabled = false;
        } else {
            verifyBtn.classList.add('opacity-50');
            verifyBtn.disabled = true;
        }
    }

    async verifyOTP() {
        const inputs = document.querySelectorAll('.otp-digit');
        const otp = Array.from(inputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            this.showNotification('Please enter the complete 6-digit code', 'error');
            return;
        }

        const verifyBtn = document.getElementById('verifyOtpBtn');
        verifyBtn.disabled = true;
        verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';

        try {
            const sessionId = this.currentOTPSession.sessionId;
            const storedSession = this.otpSessions.get(sessionId);

            if (!storedSession) {
                throw new Error('Invalid or expired session');
            }

            // Check if OTP has expired
            if (new Date() > storedSession.expiryTime) {
                this.otpSessions.delete(sessionId);
                throw new Error('OTP has expired');
            }

            // Check if too many attempts
            if (storedSession.attempts >= this.otpConfig.maxAttempts) {
                this.otpSessions.delete(sessionId);
                throw new Error('Maximum verification attempts exceeded');
            }

            // Increment attempt count
            storedSession.attempts++;
            this.otpSessions.set(sessionId, storedSession);

            // Verify OTP
            if (otp !== storedSession.otp) {
                const remainingAttempts = this.otpConfig.maxAttempts - storedSession.attempts;
                
                if (remainingAttempts > 0) {
                    document.getElementById('attemptsCount').textContent = remainingAttempts;
                    document.getElementById('remainingAttempts').classList.remove('hidden');
                }
                
                throw new Error(`Invalid OTP. ${remainingAttempts} attempts remaining.`);
            }

            // OTP is valid - clean up and return success
            this.otpSessions.delete(sessionId);

            // Clear timer
            if (this.otpTimer) {
                clearInterval(this.otpTimer);
            }
            
            // Show success animation
            inputs.forEach(input => input.classList.add('otp-success'));
            
            this.showNotification('Verification successful!', 'success');
            
            // Complete registration if this was for signup
            if (this.pendingRegistration) {
                setTimeout(async () => {
                    await this.completeRegistration(
                        this.pendingRegistration.email,
                        this.pendingRegistration.name,
                        this.pendingRegistration.whatsapp,
                        this.pendingRegistration.password
                    );
                }, 1000);
            } else {
                // Handle other OTP verification scenarios (login, etc.)
                setTimeout(() => {
                    this.showLoginForm();
                }, 1000);
            }

        } catch (error) {
            console.error('OTP verification error:', error);
            
            // Show error animation
            const container = document.getElementById('otpInputContainer');
            container.classList.add('otp-container-error');
            setTimeout(() => container.classList.remove('otp-container-error'), 500);
            
            inputs.forEach(input => {
                input.classList.add('error');
                input.value = '';
                input.classList.remove('filled');
            });
            
            this.showNotification(error.message || 'Invalid verification code', 'error');
            
            // Focus first input
            setTimeout(() => {
                document.getElementById('otp1').focus();
            }, 500);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Verify Code';
        }
    }

    async resendOTP() {
        if (!this.currentOTPSession) {
            this.showNotification('No active OTP session', 'error');
            return;
        }

        // Prevent multiple simultaneous resend requests
        if (this.otpSending) {
            this.showNotification('Already sending OTP, please wait...', 'warning');
            return;
        }

        const resendBtn = document.getElementById('resendOtpBtn');
        resendBtn.disabled = true;
        resendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Sending...';

        try {
            this.otpSending = true;

            const sessionId = this.currentOTPSession.sessionId;
            const storedSession = this.otpSessions.get(sessionId);

            if (!storedSession) {
                throw new Error('Session not found');
            }

            // Check if enough time has passed since last send
            const now = new Date();
            if (now < storedSession.canResendAt) {
                const timeLeft = Math.ceil((storedSession.canResendAt - now) / 1000);
                throw new Error(`Please wait ${timeLeft} seconds before resending`);
            }

            // Generate new OTP
            const newOTP = this.generateOTP();
            const newExpiryTime = new Date(now.getTime() + this.otpConfig.expiryMinutes * 60000);
            const newCanResendAt = new Date(now.getTime() + this.otpConfig.resendDelaySeconds * 1000);

            // Update session with new OTP
            storedSession.otp = newOTP;
            storedSession.expiryTime = newExpiryTime;
            storedSession.canResendAt = newCanResendAt;
            storedSession.attempts = 0;
            this.otpSessions.set(sessionId, storedSession);

            // Update current session for timer
            this.currentOTPSession.expiryTime = newExpiryTime.toISOString();
            this.currentOTPSession.canResendAt = newCanResendAt.toISOString();

            // Send new OTP via EmailJS
            const emailResponse = await emailjs.send(
                this.emailJSConfig.serviceId,
                this.emailJSConfig.templateId,
                {
                    email: storedSession.identifier,
                    passcode: newOTP,
                    time: newExpiryTime.toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        hour12: true,
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                },
                this.emailJSConfig.userId
            );

            this.clearOTPInputs();
            this.startOTPTimer();
            this.showNotification('Verification code resent successfully!', 'success');

        } catch (error) {
            this.showNotification(error.message || 'Failed to resend code', 'error');
        } finally {
            this.otpSending = false;
            resendBtn.disabled = false;
            resendBtn.innerHTML = '<i class="fas fa-redo mr-1"></i>Resend Code';
        }
    }

    startOTPTimer() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }

        const timerElement = document.getElementById('otpTimer');
        const resendBtn = document.getElementById('resendOtpBtn');
        
        resendBtn.classList.add('hidden');

        this.otpTimer = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(this.currentOTPSession.expiryTime).getTime();
            const canResend = new Date(this.currentOTPSession.canResendAt).getTime();
            
            const timeLeft = Math.max(0, expiry - now);
            const timeUntilResend = Math.max(0, canResend - now);
            
            if (timeLeft <= 0) {
                timerElement.textContent = 'Code expired';
                timerElement.className = 'timer-expired';
                resendBtn.classList.remove('hidden');
                clearInterval(this.otpTimer);
                return;
            }
            
            const minutes = Math.floor(timeLeft / 60000);
            const seconds = Math.floor((timeLeft % 60000) / 1000);
            
            timerElement.textContent = `Code expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 60000) { // Last minute
                timerElement.className = 'timer-warning';
            } else {
                timerElement.className = 'timer-active';
            }
            
            if (timeUntilResend <= 0) {
                resendBtn.classList.remove('hidden');
            }
        }, 1000);
    }

    clearOTPInputs() {
        const inputs = document.querySelectorAll('.otp-digit');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled', 'error', 'otp-success');
        });
        
        document.getElementById('remainingAttempts').classList.add('hidden');
        
        const verifyBtn = document.getElementById('verifyOtpBtn');
        verifyBtn.classList.add('opacity-50');
        verifyBtn.disabled = true;
    }

    cancelOTPVerification() {
        if (this.otpTimer) {
            clearInterval(this.otpTimer);
        }
        
        this.currentOTPSession = null;
        this.pendingRegistration = null;
        
        this.showLoginForm();
        this.showNotification('Verification cancelled', 'info');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    setupAnimations() {
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        window.addEventListener('scroll', () => {
            const scrollButton = document.getElementById('scrollToTop');
            if (window.pageYOffset > 300) {
                scrollButton.classList.remove('opacity-0', 'invisible');
                scrollButton.classList.add('opacity-100', 'visible');
            } else {
                scrollButton.classList.add('opacity-0', 'invisible');
                scrollButton.classList.remove('opacity-100', 'visible');
            }
        });
    }

    setupImageUpload() {
        const uploadArea = document.getElementById('imageUploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageFile(files[0]);
            }
        });
    }

    loadCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';

        this.categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = `category-filter category-item p-2 sm:p-3 ${category.color} text-white rounded-lg cursor-pointer text-center text-xs sm:text-sm font-medium hover:shadow-lg transition-all duration-200 hover:scale-105`;
            categoryElement.onclick = () => this.filterByCategory(category.id);
            categoryElement.innerHTML = `
                <i class="${category.icon} text-base sm:text-lg mb-1 sm:mb-2 block"></i>
                <span class="text-xs">${category.name}</span>
            `;
            grid.appendChild(categoryElement);
        });
    }

    filterByCategory(categoryId) {
        if (this.activeFilters.category === categoryId) {
            this.activeFilters.category = null;
        } else {
            this.activeFilters.category = categoryId;
        }
        
        this.updateCategoryButtons();
        this.applyFilters();
        this.updateActiveFilters();
    }

    updateCategoryButtons() {
        const buttons = document.querySelectorAll('.category-filter');
        buttons.forEach((btn, index) => {
            const category = this.categories[index];
            if (this.activeFilters.category === category.id) {
                btn.classList.add('active', 'ring-2', 'ring-white');
            } else {
                btn.classList.remove('active', 'ring-2', 'ring-white');
            }
        });
    }

    performSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        this.activeFilters.search = searchTerm;
        this.applyFilters();
        this.updateActiveFilters();
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            const matchesCategory = !this.activeFilters.category || product.category === this.activeFilters.category;
            const matchesSearch = !this.activeFilters.search || 
                product.name.toLowerCase().includes(this.activeFilters.search) ||
                product.description.toLowerCase().includes(this.activeFilters.search) ||
                product.seller.toLowerCase().includes(this.activeFilters.search) ||
                product.condition.toLowerCase().includes(this.activeFilters.search);
            
            return matchesCategory && matchesSearch;
        });
        
        this.displayProducts();
    }

    updateActiveFilters() {
        const activeFiltersDiv = document.getElementById('activeFilters');
        const filterTags = document.getElementById('filterTags');
        
        filterTags.innerHTML = '';
        let hasFilters = false;

        if (this.activeFilters.category) {
            const category = this.categories.find(c => c.id === this.activeFilters.category);
            if (category) {
                const tag = document.createElement('span');
                tag.className = 'px-3 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center';
                tag.innerHTML = `
                    <i class="${category.icon} mr-1"></i>
                    <span>${category.name}</span>
                    <button onclick="juitApp.clearCategoryFilter()" class="ml-1 text-blue-200 hover:text-white">×</button>
                `;
                filterTags.appendChild(tag);
                hasFilters = true;
            }
        }

        if (this.activeFilters.search) {
            const tag = document.createElement('span');
            tag.className = 'px-3 py-1 bg-green-600 text-white text-xs rounded-full flex items-center';
            tag.innerHTML = `
                <i class="fas fa-search mr-1"></i>
                <span>Search: "${this.activeFilters.search}"</span>
                <button onclick="juitApp.clearSearchFilter()" class="ml-1 text-green-200 hover:text-white">×</button>
            `;
            filterTags.appendChild(tag);
            hasFilters = true;
        }

        activeFiltersDiv.classList.toggle('hidden', !hasFilters);
    }

    clearCategoryFilter() {
        this.activeFilters.category = null;
        this.updateCategoryButtons();
        this.applyFilters();
        this.updateActiveFilters();
    }

    clearSearchFilter() {
        this.activeFilters.search = '';
        document.getElementById('searchInput').value = '';
        this.applyFilters();
        this.updateActiveFilters();
    }

    clearAllFilters() {
        this.activeFilters = { category: null, search: '' };
        document.getElementById('searchInput').value = '';
        this.updateCategoryButtons();
        this.applyFilters();
        this.updateActiveFilters();
    }

    async loadProducts() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const productContainer = document.getElementById('productContainer');
        const emptyState = document.getElementById('emptyState');
        
        loadingIndicator.classList.remove('hidden');
        productContainer.innerHTML = '';
        emptyState.classList.add('hidden');

        try {
            const githubProducts = await this.loadFromGitHub();
            
            if (githubProducts && githubProducts.length > 0) {
                this.products = githubProducts;
                this.filteredProducts = [...githubProducts];
                this.displayProducts();
                this.showNotification('Products loaded successfully!', 'success');
            } else {
                this.products = [];
                this.filteredProducts = [];
                this.displayProducts();
                this.showNotification('No products found. Be the first to list!', 'info');
            }
        } catch (error) {
            console.error('GitHub load error:', error);
            this.products = [];
            this.filteredProducts = [];
            this.displayProducts();
            this.showNotification('Unable to load products. Please try refreshing.', 'warning');
        }
        
        loadingIndicator.classList.add('hidden');
    }

    async loadFromGitHub() {
        try {
            const response = await fetch(`${this.apiEndpoint}?action=getProducts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await response.json();
            return data.products || [];
        } catch (error) {
            console.error('GitHub load error:', error);
            return [];
        }
    }

    getPublicImageUrl(imagePath) {
        if (!imagePath) {
            return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop';
        }
        
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Extract filename from path
        const filename = imagePath.split('/').pop();
        
        // Create public GitHub raw URL for the media repository
        return `https://raw.githubusercontent.com/${this.mediaConfig.owner}/${this.mediaConfig.repo}/${this.mediaConfig.branch}/images/${filename}`;
    }

    displayProducts() {
        const container = document.getElementById('productContainer');
        const emptyState = document.getElementById('emptyState');
        
        container.innerHTML = '';
        
        if (this.filteredProducts.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        this.filteredProducts.forEach((product, index) => {
            const productElement = this.createProductElement(product, index);
            container.appendChild(productElement);
            
            setTimeout(() => {
                productElement.classList.add('animate-fade-in-up');
            }, index * 100);
        });
    }

    createProductElement(product, index) {
        const productDiv = document.createElement('div');
        productDiv.className = 'product-card glass bg-dark-800/30 rounded-xl overflow-hidden shadow-xl hover-lift border border-dark-600/30 relative';
        
        const isOwner = this.currentUser && this.currentUser.email === product.sellerEmail;
        const category = this.categories.find(c => c.id === product.category);
        
        productDiv.innerHTML = `
            <div class="relative h-36 sm:h-48 bg-gray-800 flex items-center justify-center">
                <div class="image-placeholder absolute inset-0 flex items-center justify-center">
                    <i class="fas fa-image text-4xl text-dark-400"></i>
                </div>
                <img src="${product.imagePath}" 
                     alt="${product.name}"
                     class="product-image absolute inset-0 w-full h-full object-cover loading"
                     onload="this.classList.remove('loading'); this.previousElementSibling.style.display='none';"
                     onerror="this.style.display='none'; this.previousElementSibling.innerHTML='<i class=\\"fas fa-exclamation-triangle text-2xl text-red-400\\"></i><p class=\\"text-xs mt-2 text-red-300\\">Image not available</p>'; this.previousElementSibling.classList.add('image-error');">
                <div class="absolute inset-0 bg-gradient-to-t from-dark-900/50 to-transparent"></div>
                ${isOwner ? `
                    <button onclick="juitApp.deleteProduct(${product.id})" 
                            class="delete-btn absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 opacity-0">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                ` : ''}
                <div class="absolute bottom-2 left-2">
                    <span class="px-2 py-1 ${category?.color || 'bg-gray-600'} text-white text-xs font-medium rounded flex items-center">
                        <i class="${category?.icon || 'fas fa-box'} mr-1"></i>
                        ${category?.name || 'Other'}
                    </span>
                </div>
            </div>
            <div class="p-4 sm:p-6">
                <h3 class="text-lg sm:text-xl font-bold mb-2 text-white">${product.name}</h3>
                <p class="text-dark-300 text-sm mb-3 flex items-center">
                    <i class="fas fa-user mr-2"></i>
                    ${product.seller}
                </p>
                
                <div class="flex justify-between items-center mb-4">
                    <span class="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-medium rounded-full">
                        <i class="fas fa-check-circle mr-1"></i>
                        ${product.condition}
                    </span>
                    <span class="text-xl sm:text-2xl font-bold text-green-400">₹${product.price.toLocaleString()}</span>
                </div>
                
                <p class="text-dark-300 text-sm mb-4 sm:mb-6 line-clamp-2">${product.description}</p>
                
                <button onclick="juitApp.openWhatsAppChat(${index})" 
                        class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2 sm:py-3 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-sm sm:text-base">
                    <i class="fab fa-whatsapp mr-2"></i>
                    Chat with Seller
                </button>
            </div>
        `;

        if (isOwner) {
            productDiv.addEventListener('mouseenter', () => {
                const deleteBtn = productDiv.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.classList.remove('opacity-0');
                    deleteBtn.classList.add('opacity-100');
                }
            });
            
            productDiv.addEventListener('mouseleave', () => {
                const deleteBtn = productDiv.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.classList.add('opacity-0');
                    deleteBtn.classList.remove('opacity-100');
                }
            });
        }
        
        return productDiv;
    }

    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            this.products = this.products.filter(p => p.id !== productId);
            this.applyFilters();

            const success = await this.saveProductsToGitHub();
            
            if (success) {
                this.showNotification('Product deleted successfully!', 'success');
            } else {
                this.showNotification('Failed to delete from server, but removed locally', 'warning');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Error deleting product', 'error');
        }
    }

    openWhatsAppChat(productIndex) {
        const product = this.filteredProducts[productIndex];
        
        const message = `Hi! I'm interested in your ${product.name} listed for ₹${product.price.toLocaleString()} on JUIT OLX. Is it still available?`;
        const whatsappUrl = `https://wa.me/${product.whatsapp}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        this.showNotification('Opening WhatsApp...', 'success');
    }

    showSellModal() {
        if (!this.currentUser) {
            this.showNotification('Please login first', 'error');
            return;
        }
        
        document.getElementById('sellModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    closeSellModal() {
        document.getElementById('sellModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.resetForm();
    }

    resetForm() {
        document.getElementById('sellForm').reset();
        document.getElementById('imagePreview').classList.add('hidden');
        this.selectedImage = null;
    }

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleImageFile(file);
        }
    }

    handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select a valid image file', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        this.selectedImage = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImage').src = e.target.result;
            document.getElementById('imageName').textContent = file.name;
            document.getElementById('imagePreview').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    async handleFormSubmission() {
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        
        try {
            if (!this.selectedImage) {
                this.showNotification('Please select an image', 'error');
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading-spinner inline-block mr-2"></div>Uploading...';

            const formData = {
                name: document.getElementById('productName').value.trim(),
                category: document.getElementById('productCategory').value,
                price: parseInt(document.getElementById('productPrice').value),
                condition: document.getElementById('productCondition').value,
                description: document.getElementById('productDescription').value.trim()
            };

            const imageUrl = await this.uploadImageToPublicRepo(this.selectedImage);
            if (!imageUrl) {
                this.showNotification('Failed to upload image', 'error');
                return;
            }

            const newProduct = {
                id: Date.now(),
                name: formData.name,
                price: formData.price,
                seller: this.currentUser.name,
                sellerEmail: this.currentUser.email,
                whatsapp: this.currentUser.whatsapp,
                condition: formData.condition,
                category: formData.category,
                description: formData.description,
                imagePath: imageUrl,
                dateAdded: new Date().toISOString()
            };

            this.products.unshift(newProduct);
            this.applyFilters();

            const success = await this.saveProductsToGitHub();
            
            if (success) {
                this.showNotification('Product listed successfully!', 'success');
                this.closeSellModal();
            } else {
                this.products.shift();
                this.applyFilters();
                this.showNotification('Failed to save product. Please try again.', 'error');
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('An error occurred. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }

    async uploadImageToPublicRepo(imageFile) {
        try {
            const base64Data = await this.fileToBase64(imageFile);
            const base64Content = base64Data.split(',')[1];

            const timestamp = Date.now();
            const extension = imageFile.name.split('.').pop();
            const filename = `product_${timestamp}.${extension}`;

            // Upload image via server-side API
            const response = await fetch(`${this.apiEndpoint}?action=uploadImage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ base64Content, filename })
            });
            const data = await response.json();
            return data.imageUrl || null;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    }

    async saveProductsToGitHub() {
        try {
            const response = await fetch(`${this.apiEndpoint}?action=saveProducts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products: this.products })
            });
            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Error saving to GitHub:', error);
            return false;
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    showUserMenu() {
        if (!this.currentUser) return;
        
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        const menu = document.createElement('div');
        menu.className = 'user-menu fixed top-16 right-4 glass bg-dark-800/90 rounded-xl border border-dark-600/50 z-50 p-4 min-w-56 shadow-2xl';
        menu.innerHTML = `
            <div class="border-b border-dark-600/50 pb-3 mb-3">
                <p class="font-semibold text-white flex items-center">
                    <i class="fas fa-user-circle mr-2 text-blue-400"></i>
                    ${this.currentUser.name}
                </p>
                <p class="text-sm text-dark-300 ml-6">${this.currentUser.email}</p>
                <p class="text-xs text-dark-400 ml-6 flex items-center">
                    <i class="fab fa-whatsapp mr-1 text-green-400"></i>
                    +${this.currentUser.whatsapp}
                </p>
            </div>
            <div class="space-y-2">
                <button onclick="juitApp.showMyProducts()" 
                        class="w-full text-left text-blue-400 hover:text-blue-300 py-2 px-3 rounded hover:bg-dark-700/50 transition-colors flex items-center">
                    <i class="fas fa-boxes mr-2"></i>
                    My Products
                </button>
                <button onclick="juitApp.logout()" 
                        class="w-full text-left text-red-400 hover:text-red-300 py-2 px-3 rounded hover:bg-dark-700/50 transition-colors flex items-center">
                    <i class="fas fa-sign-out-alt mr-2"></i>
                    Logout
                </button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 100);
    }

    showMyProducts() {
        if (!this.currentUser) return;
        
        const userProducts = this.products.filter(p => p.sellerEmail === this.currentUser.email);
        this.filteredProducts = userProducts;
        this.displayProducts();
        
        document.querySelector('.user-menu')?.remove();
        
        this.activeFilters = { category: null, search: 'my-products' };
        const activeFiltersDiv = document.getElementById('activeFilters');
        const filterTags = document.getElementById('filterTags');
        
        filterTags.innerHTML = `
            <span class="px-3 py-1 bg-purple-600 text-white text-xs rounded-full flex items-center space-x-1">
                <i class="fas fa-user mr-1"></i>
                <span>My Products (${userProducts.length})</span>
                <button onclick="juitApp.showAllProducts()" class="ml-1 text-purple-200 hover:text-white">×</button>
            </span>
        `;
        activeFiltersDiv.classList.remove('hidden');
        
        this.showNotification(`Showing your ${userProducts.length} products`, 'info');
    }

    logout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('juitUser');
            this.currentUser = null;
            document.querySelector('.user-menu')?.remove();
            this.showAuthModal();
            this.showNotification('Logged out successfully', 'success');
        }
    }

    handleScroll() {
        const products = document.querySelectorAll('.product-card');
        products.forEach(product => {
            const rect = product.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible && !product.classList.contains('animated')) {
                product.classList.add('animated', 'animate-fade-in-up');
            }
        });
    }

    handleSearch(event) {
        if (event.key === 'Enter') {
            this.performSearch();
        }
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg z-50 max-w-sm animate-slide-in`;
        
        let bgColor, iconClass;
        if (type === 'success') {
            bgColor = 'bg-green-600';
            iconClass = 'fas fa-check-circle';
        } else if (type === 'error') {
            bgColor = 'bg-red-600';
            iconClass = 'fas fa-exclamation-circle';
        } else if (type === 'warning') {
            bgColor = 'bg-yellow-600';
            iconClass = 'fas fa-exclamation-triangle';
        } else {
            bgColor = 'bg-blue-600';
            iconClass = 'fas fa-info-circle';
        }
        
        notification.classList.add(bgColor, 'text-white');
        
        notification.innerHTML = `
            <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                    <i class="${iconClass}"></i>
                </div>
                <div class="flex-1">
                    <p class="text-sm">${message}</p>
                </div>
                <button onclick="this.closest('.notification').remove()" class="flex-shrink-0 text-white hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    async refreshProducts() {
        this.showNotification('Refreshing products...', 'info');
        await this.loadProducts();
    }

    showAllProducts() {
        document.getElementById('searchInput').value = '';
        this.activeFilters = { category: null, search: '' };
        this.updateCategoryButtons();
        this.filteredProducts = [...this.products];
        this.displayProducts();
        this.updateActiveFilters();
        this.showNotification('Showing all products', 'info');
    }
}

let juitApp;
document.addEventListener('DOMContentLoaded', () => {
    juitApp = new JUITOLXApp();
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
