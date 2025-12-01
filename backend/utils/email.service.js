import nodemailer from 'nodemailer';

// Create reusable transporter object using SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

/**
 * Send OTP verification email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} name - User's name
 */
export const sendOTPEmail = async (email, otp, name) => {
  console.log(`\n📧 Attempting to send OTP email to: ${email}`);
  
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  Email credentials not configured. Showing OTP in console.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${email}`);
    console.log(`Name: ${name}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: 5 minutes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    return { success: false, otp, error: 'Email not configured' };
  }
  
  try {
    const transporter = createTransporter();

    // Verify connection first
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Devil\'s Den'}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Email Verification - Your OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-box {
              background-color: #f8f9fa;
              border: 2px dashed #667eea;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .info-text {
              color: #666;
              font-size: 14px;
              margin: 20px 0;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Email Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for signing up with Devil's Den. To complete your registration, please verify your email address.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 12px;">Enter this code on the verification page</p>
              </div>
              
              <p class="info-text">
                ⏱️ This code will expire in <strong>5 minutes</strong>.<br>
                If you didn't request this code, please ignore this email.
              </p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. We will never ask for your OTP via phone or email.
              </div>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; ${new Date().getFullYear()} Devil's Den. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Hello ${name}!\n\nYour OTP for email verification is: ${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't create an account with Devil's Den, please ignore this email.\n\nThank you,\nDevil's Den Team`,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   To: ${email}`);
    console.log(`   OTP Code: ${otp}\n`);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('\n❌ ERROR SENDING EMAIL:');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`Error: ${error.message}`);
    
    // Check if it's a Gmail-specific error
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.error('\n💡 Gmail Authentication Issue:');
      console.error('   1. Enable 2-Step Verification: https://myaccount.google.com/security');
      console.error('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('   3. Update EMAIL_PASSWORD in .env with the 16-character app password\n');
    }
    
    console.error(`To: ${email}`);
    console.error(`\n📧 FALLBACK - OTP Code: ${otp}`);
    console.error('   (User can still verify using this code)');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Return failure but include OTP for fallback
    return { success: false, error: error.message, otp };
  }
};

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
