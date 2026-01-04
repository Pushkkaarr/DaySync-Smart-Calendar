const nodemailer = require('nodemailer');
require('dotenv').config();

// ================= GMAIL SMTP CONFIGURATION =================
// Using explicit SMTP settings instead of service: 'gmail' for better reliability
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' ? true : false, // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // Google App Password (not regular password)
        },
        tls: {
            rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === 'true' ? true : false
        }
    });
};

const sendEmail = async (to, subject, html) => {
    let transporter;
    try {
        // Validate required environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ Email configuration error: EMAIL_USER or EMAIL_PASS not set');
            return false;
        }

        if (!to || !to.includes('@')) {
            console.error(`❌ Invalid email address: ${to}`);
            return false;
        }

        transporter = createTransporter();

        // For testing: send to both the user email AND the admin email
        let recipientEmails = [to];
        if (process.env.EMAIL_USER && to !== process.env.EMAIL_USER) {
            recipientEmails.push(process.env.EMAIL_USER);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmails.join(','), // Send to multiple recipients
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = sendEmail;
