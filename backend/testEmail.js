// ================= EMAIL SERVICE TEST SCRIPT =================
// This script tests the Gmail SMTP configuration
// Run with: node testEmail.js

const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmailSending = async () => {
    console.log('🧪 Starting Email Configuration Test...\n');

    // Check environment variables
    console.log('📋 Checking environment variables:');
    console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
    console.log(`  EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
    console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com (default)'}`);
    console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || '587 (default)'}`);
    console.log(`  EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'false (default)'}`);
    console.log(`  EMAIL_REJECT_UNAUTHORIZED: ${process.env.EMAIL_REJECT_UNAUTHORIZED || 'false (default)'}\n`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email credentials not found in .env file!');
        process.exit(1);
    }

    try {
        // Create transporter with explicit SMTP settings
        console.log('🔧 Creating SMTP transporter...');
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true' ? true : false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED === 'true' ? true : false
            }
        });

        console.log('✅ Transporter created successfully\n');

        // Verify connection
        console.log('🔌 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully\n');

        // Send test email
        console.log('📧 Sending test email...');
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: '🧪 DaySync Calendar - Email Test',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>✅ Email Service Test Successful!</h2>
                    <p>Your Gmail SMTP configuration is working correctly.</p>
                    <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3>Test Details:</h3>
                        <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
                        <p><strong>To:</strong> ${process.env.EMAIL_USER}</p>
                        <p><strong>Host:</strong> ${process.env.EMAIL_HOST || 'smtp.gmail.com'}</p>
                        <p><strong>Port:</strong> ${process.env.EMAIL_PORT || '587'}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                    </div>
                    <p><em>This is an automated test email from DaySync Smart Calendar.</em></p>
                </div>
            `
        });

        console.log('✅ Test email sent successfully!\n');
        console.log('📬 Email Details:');
        console.log(`  Message ID: ${info.messageId}`);
        console.log(`  Response: ${info.response}`);
        console.log('\n✨ Email service is ready to use! ✨\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n📌 Troubleshooting Tips:');
        console.error('  1. Ensure EMAIL_PASS is a Google App Password (not your regular Gmail password)');
        console.error('  2. Visit: https://myaccount.google.com/apppasswords to generate one');
        console.error('  3. Enable "Less secure app access" if needed');
        console.error('  4. Check your internet connection');
        console.error('  5. Verify EMAIL_USER and EMAIL_PASS in .env are correct\n');
        process.exit(1);
    }
};

// Run the test
testEmailSending();
