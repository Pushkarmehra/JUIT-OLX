# 🏫 JUIT OLX - Campus Marketplace

<div align="center">

![JUIT OLX Logo](https://img.shields.io/badge/JUIT-OLX-blue?style=for-the-badge&logo=shopify&logoColor=white)

### 🎓 *The Ultimate Campus Trading Platform for JUIT Students*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Wesite-success?style=for-the-badge)](https://www.juitolx.engineer/)
[![GitHub Stars](https://img.shields.io/github/stars/Pushkarmehra/JUIT_OLX?style=for-the-badge&logo=github)](https://github.com/Pushkarmehra/JUIT_OLX)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 **Project Overview**

**JUIT OLX** is a modern, secure, and feature-rich campus marketplace designed exclusively for **Jaypee University of Information Technology (JUIT)** students. Built with cutting-edge web technologies, it provides a seamless platform for buying and selling items within the campus community.

<div align="center">


## ✨ **Key Features**

<table>
<tr>
<td width="50%">

### 🔐 **Security & Authentication**
- 🛡️ **OTP Email Verification** using EmailJS
- 🎓 **JUIT Domain Validation** (@juitsolan.in only)
- 🔒 **Encrypted Password Storage** with CryptoJS
- 👤 **Secure Session Management**
- 🚫 **Account Lockout Protection**

### 📱 **User Experience**
- 🎨 **Dark Theme UI** with glassmorphism effects
- 📱 **Fully Responsive Design** (Mobile-first)
- ⚡ **Real-time Search & Filtering**
- 🎭 **Smooth Animations** using Tailwind CSS
- 🖼️ **Image Upload & Management**

</td>
<td width="50%">

### 🛒 **Marketplace Features**
- 📦 **8 Product Categories** (Books, Electronics, etc.)
- 💬 **WhatsApp Integration** for seller contact
- 📸 **Image Upload to GitHub** for storage
- 🏷️ **Product Condition Tracking**
- 🔍 **Advanced Search Functionality**

### 👥 **Social Integration**
- 📱 **WhatsApp Direct Messaging**
- 📧 **Email Notifications**
- 👨‍💼 **Developer Contact Links**
- 🌐 **Social Media Integration**

</td>
</tr>
</table>

---

## 🛠️ **Tech Stack & Libraries**

<div align="center">

### **Frontend Technologies**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

| Library/Service | Version | Purpose | Documentation |
|-----------------|---------|---------|---------------|
| **🎨 Tailwind CSS** | `Latest CDN` | Utility-first CSS framework for rapid UI development | [Docs](https://tailwindcss.com/docs) |
| **🔧 CryptoJS** | `4.1.1` | Client-side cryptography for password encryption | [Docs](https://cryptojs.gitbook.io/docs/) |
| **📧 EmailJS** | `4.x` | Send emails directly from frontend without backend | [Docs](https://www.emailjs.com/docs/) |
| **🎭 Font Awesome** | `6.4.0` | Comprehensive icon library for UI elements | [Docs](https://fontawesome.com/docs) |
| **🗃️ GitHub API** | `v3` | Data storage and image hosting solution | [Docs](https://docs.github.com/en/rest) |

---

## 🎯 **Core Functionalities**

### 🔐 **Authentication System**

```javascript
// Secure OTP Verification Flow
async initiateOTPVerification(email) {
  ✅ Generate 6-digit OTP
  ✅ Send via EmailJS
  ✅ 15-minute expiry
  ✅ 3 attempt limit
  ✅ Resend protection
}
```

**Features:**
- 📧 **Email OTP Verification** with real-time delivery
- 🛡️ **Anti-spam Protection** (30-second resend cooldown)
- 🔒 **Session Security** with automatic cleanup
- ⚡ **Rate Limiting** to prevent brute force attacks

### 🛒 **Marketplace Operations**

<details>
<summary>📦 <strong>Product Management</strong></summary>

- **Create Listings**: Upload images, set prices, add descriptions
- **Category System**: 8 predefined categories with custom icons
- **Condition Tracking**: Brand New, Like New, Excellent, Good, Fair
- **Image Storage**: Secure GitHub repository integration
- **Real-time Updates**: Instant product list refresh

</details>

<details>
<summary>🔍 <strong>Search & Filter System</strong></summary>

- **Live Search**: Real-time product filtering as you type
- **Category Filters**: Filter by specific product categories
- **Combined Filters**: Search + category combination
- **Filter Tags**: Visual representation of active filters
- **Clear Options**: Easy filter reset functionality

</details>

<details>
<summary>💬 <strong>Communication Features</strong></summary>

- **WhatsApp Integration**: Direct seller contact via WhatsApp
- **Pre-formatted Messages**: Auto-generated inquiry messages
- **Contact Protection**: Secure seller information display
- **Multi-platform Support**: Works on desktop and mobile

</details>

---

## 🎨 **UI/UX Features**

### 🌙 **Modern Dark Theme**

<div align="center">


</div>

**Design Elements:**
- 🔮 **Glassmorphism Effects** with backdrop blur
- 🌈 **Gradient Backgrounds** and smooth transitions
- ✨ **Hover Animations** for interactive elements
- 📱 **Responsive Grid Layouts** for all screen sizes
- 🎭 **Custom Animations** using CSS keyframes

### 🎬 **Animation Library**

```css
/* Custom Animation Classes */
.hover-lift:hover {
  transform: translateY(-8px) scale(1.02);
}

.glass {
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

---

## 🚀 **Getting Started**

### 📋 **Prerequisites**

- 🌐 Modern web browser (Chrome, Firefox, Safari, Edge)
- 📧 EmailJS account for OTP functionality
- 🗃️ GitHub repository for data storage
- 📱 Valid JUIT email address (@juitsolan.in)

### ⚡ **Quick Setup**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Pushkarmehra/JUIT_OLX.git
   cd JUIT_OLX
   ```

2. **Configure EmailJS**
   ```javascript
   // Update in index.html
   this.emailJSConfig = {
     serviceId: 'your_service_id',
     templateId: 'your_template_id',
     userId: 'your_public_key'
   };
   ```

3. **Setup GitHub Integration**
   ```javascript
   // Configure your GitHub repositories
   this.dataConfig = {
     owner: 'your_username',
     repo: 'data_repository',
     token: 'your_access_token'
   };
   ```

4. **Launch Application**
   ```bash
   # Open index.html in your browser
   # Or use a local server
   python -m http.server 8000
   ```

---

## 📊 **Project Statistics**

<div align="center">

| Metric | Value |
|--------|-------|
| **📄 Lines of Code** | 2,500+ |
| **🎨 CSS Classes** | 150+ |
| **⚡ JavaScript Functions** | 80+ |
| **📱 Responsive Breakpoints** | 5 |
| **🎭 Custom Animations** | 12 |
| **🔒 Security Features** | 8 |

</div>

---

## 🔧 **Configuration Guide**

### 📧 **EmailJS Setup**

<details>
<summary>Click to expand EmailJS configuration steps</summary>

1. **Create EmailJS Account** at [emailjs.com](https://www.emailjs.com/)
2. **Setup Email Service** (Gmail, Outlook, etc.)
3. **Create Email Template** with these variables:
   ```
   To: {{email}}
   Subject: JUIT OLX - Verification Code
   
   Your verification code: {{passcode}}
   Valid until: {{time}}
   ```
4. **Get Credentials**:
   - Service ID
   - Template ID  
   - Public Key
5. **Update Configuration** in `index.html`

</details>

### 🗃️ **GitHub Storage Setup**

<details>
<summary>Click to expand GitHub storage configuration</summary>

1. **Create Two Repositories**:
   - `juit-data-store` (for user data and products)
   - `juit-olx-media` (for image storage)

2. **Generate Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create token with `repo` scope

3. **Repository Structure**:
   ```
   juit-data-store/
   ├── personal.json    # User data
   └── products.json    # Product listings
   
   juit-olx-media/
   └── images/          # Product images
   ```

</details>

---

## 🎯 **Usage Guide**

### 👤 **For Students**

1. **📝 Registration**
   - Use your JUIT email (@juitsolan.in)
   - Verify via OTP sent to email
   - Complete profile with WhatsApp number

2. **🛒 Buying Items**
   - Browse categories or search products
   - View detailed product information
   - Contact seller via WhatsApp integration

3. **💰 Selling Items**
   - Click "SELL" button to create listing
   - Upload product image and details
   - Manage your listings from user menu

### 👨‍💼 **For Administrators**

- **📊 User Management**: Access user data through GitHub repository
- **🗃️ Content Moderation**: Review and manage product listings
- **📧 Support**: Handle password recovery requests via email

---

## 🛡️ **Security Features**

<div align="center">

### 🔒 **Multi-Layer Security Architecture**

</div>

| Security Layer | Implementation | Purpose |
|----------------|----------------|---------|
| **🎓 Domain Validation** | `@juitsolan.in` email check | Restrict access to JUIT students only |
| **📧 OTP Verification** | EmailJS integration | Verify email ownership |
| **🔐 Password Encryption** | CryptoJS AES encryption | Secure password storage |
| **⏱️ Session Management** | Browser sessionStorage | Temporary secure sessions |
| **🚫 Rate Limiting** | Attempt counters | Prevent brute force attacks |
| **🛡️ Input Validation** | Client-side validation | Prevent malicious input |
| **🔒 CSRF Protection** | Secure form handling | Prevent cross-site attacks |

---

## 🎨 **Design System**

### 🎨 **Color Palette**

```css
/* Primary Colors */
--blue-400: #3b82f6;    /* Primary Blue */
--purple-400: #8b5cf6;  /* Accent Purple */
--green-400: #22c55e;   /* Success Green */
--red-400: #ef4444;     /* Error Red */

/* Dark Theme */
--dark-900: #0f172a;    /* Background */
--dark-800: #1e293b;    /* Card Background */
--dark-600: #475569;    /* Border */
```

### 📱 **Responsive Design**

| Breakpoint | Screen Size | Layout Changes |
|------------|-------------|----------------|
| **📱 Mobile** | < 640px | Single column, simplified navigation |
| **📱 Mobile-L** | < 768px | Adjusted spacing, stacked elements |
| **💻 Tablet** | < 1024px | Two-column grid, medium spacing |
| **🖥️ Desktop** | < 1280px | Three-column grid, full features |
| **🖥️ Large** | > 1280px | Maximum width container, optimal spacing |

---

## 🤝 **Contributing**

We welcome contributions from the JUIT community! Here's how you can help:

### 🛠️ **Development Setup**

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Changes & Test**
4. **Commit with Conventional Commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push & Create Pull Request**

### 📝 **Contribution Guidelines**

- 🧪 **Test your changes** thoroughly
- 📱 **Ensure mobile responsiveness**
- 🎨 **Follow existing design patterns**
- 📖 **Update documentation** if needed
- 🔒 **Maintain security standards**

---

## 👨‍💻 **Meet the Developers**

<div align="center">

<table>
<tr>
<td align="center" width="50%">

### 🚀 **Pushkar Mehra**
*Lead Developer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Pushkarmehra)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pushkar-mehra-311820321/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:241033037@juitsolan.in)

**Frontend Development • UI/UX Design • Security Implementation**

</td>
<td align="center" width="50%">

### 🎯 **Shourya Thakur**
*Co-Developer*

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Shourya-Thakur)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/shouryathakur/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:241033027@juitsolan.in)

**Backend Integration • API Development • Testing**

</td>
</tr>
</table>

</div>

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 JUIT OLX Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 **Acknowledgments**

<div align="center">

### 🎓 **Special Thanks**

- **Jaypee University of Information Technology** for providing the inspiration
- **JUIT Student Community** for feedback and testing
- **Open Source Contributors** for the amazing libraries used
- **GitHub** for providing free hosting and storage solutions

</div>

---

## 📞 **Support & Contact**

<div align="center">

### 🆘 **Need Help?**
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/919317299909)
[![Email Support](https://img.shields.io/badge/Email_Support-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:241033037@juitolx.com)

### 🐛 **Found a Bug?**

[🚨 Report Issues](https://github.com/Pushkarmehra/JUIT_OLX/issues/new?template=bug_report.md) | [💡 Request Features](https://github.com/Pushkarmehra/JUIT_OLX/issues/new?template=feature_request.md)

</div>

---

<div align="center">

### 🌟 **If you found this project helpful, please give it a star!**

[![Star on GitHub](https://img.shields.io/github/stars/Pushkarmehra/juit-olx?style=social)](https://github.com/Pushkarmehra/juit-olx)

---

**Made with ❤️ for the JUIT Community**

*Building the future of campus commerce, one transaction at a time.*

![Footer Wave](https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer)

</div>
