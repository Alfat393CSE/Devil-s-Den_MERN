import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";
import { generateOTP, sendOTPEmail } from "../utils/email.service.js";

// Email validation function
const validateEmail = (email) => {
  // Basic email format check
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Check for suspicious patterns
  if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Check domain has at least one dot
  const domain = email.split('@')[1];
  if (!domain || !domain.includes('.')) {
    return { isValid: false, message: "Invalid email domain" };
  }

  return { isValid: true };
};

export const signup = async (req, res) => {
  console.log('\n🔵 === SIGNUP FUNCTION CALLED ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { name, email, username, password } = req.body;

    console.log('Signup attempt:', { name, email, username, password: password ? '***' : undefined });

    if (!name || !email || !password) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      console.log('Email validation failed:', emailValidation.message);
      return res.status(400).json({ success: false, message: emailValidation.message });
    }

    // Check if user exists (only check username if it's provided)
    const query = { email };
    if (username) {
      query.$or = [{ email }, { username }];
      delete query.email;
    }
    
    const existingUser = await User.findOne(query);
    if (existingUser) {
      if (existingUser.email === email) {
        console.log('Email already exists:', email);
        return res.status(400).json({ success: false, message: "Email already exists" });
      }
      if (existingUser.username === username) {
        console.log('Username already exists:', username);
        return res.status(400).json({ success: false, message: "Username already exists" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiration (5 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const user = await User.create({
      name,
      email,
      username: username || email.split("@")[0], // fallback to email prefix if no username
      password: hashedPassword,
      isVerified: false,
      emailVerificationOTP: otp,
      emailVerificationOTPExpires: otpExpires
    });

    console.log('User created successfully:', user.email);
    console.log('Generated OTP:', otp);

    // Create welcome notification
    try {
      await Notification.create({
        user: user._id,
        message: `👋 Welcome ${user.name}! Please verify your email to get started.`,
        type: "info",
        read: false
      });
      console.log(`✅ Welcome notification created for ${user.name}`);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.name);
    
    if (emailResult.success) {
      console.log('✅ OTP email sent successfully');
      res.status(201).json({
        success: true,
        message: "Account created! Please check your email for the OTP code.",
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified
        }
      });
    } else {
      // Email failed but user is created - show OTP in response for fallback
      console.log('⚠️  Email failed, showing OTP in response');
      res.status(201).json({
        success: true,
        message: "Account created! Email service temporarily unavailable.",
        user: {
          id: user._id,
          email: user.email,
          isVerified: user.isVerified
        },
        developmentOTP: otp, // Only for development - remove in production
        note: "Check backend console for OTP code"
      });
    }
  } catch (error) {
    console.error("Error in signup:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.isVerified) {
      // Generate and send new OTP automatically
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
      
      user.emailVerificationOTP = otp;
      user.emailVerificationOTPExpires = otpExpires;
      await user.save();
      
      console.log('🔄 User not verified. Sending new OTP:', otp);
      
      // Send OTP email
      const emailResult = await sendOTPEmail(user.email, otp, user.name);
      
      return res.status(403).json({ 
        success: false, 
        message: "Please verify your email. A new OTP has been sent.",
        requiresVerification: true,
        email: user.email,
        otpSent: emailResult.success,
        developmentOTP: emailResult.success ? undefined : otp
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Create sign-in notification
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'UTC',
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    
    const notificationMessage = user.role === 'admin' 
      ? `🔐 Administrator signed in successfully at ${currentTime}`
      : `✅ You signed in successfully at ${currentTime}`;

    try {
      await Notification.create({
        user: user._id,
        message: notificationMessage,
        type: "success",
        read: false
      });
      console.log(`✅ Sign-in notification created for ${user.name}`);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Don't fail signin if notification creation fails
    }

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Error in signin:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const makeAdmin = async (req, res) => {
  try {
    const { email, secret } = req.body;

    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, message: "Invalid secret" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({
      success: true,
      message: "User promoted to admin successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Error in makeAdmin:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    // Check if OTP exists
    if (!user.emailVerificationOTP) {
      return res.status(400).json({ success: false, message: "No OTP found. Please request a new one." });
    }

    // Check if OTP is expired
    if (user.emailVerificationOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Check if OTP matches
    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();

    // Create email verification notification
    try {
      await Notification.create({
        user: user._id,
        message: `🎉 Welcome to Devil's Den! Your email has been verified successfully.`,
        type: "success",
        read: false
      });
      console.log(`✅ Verification notification created for ${user.name}`);
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
    }

    // Generate JWT token for automatic login after verification
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    // Generate new OTP and set expiration (5 minutes)
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    const emailResult = await sendOTPEmail(user.email, otp, user.name);

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: "New OTP sent to your email."
      });
    } else {
      // Email failed but OTP is saved - return OTP for fallback
      res.status(200).json({
        success: true,
        message: "New OTP generated. Email service unavailable.",
        developmentOTP: otp, // Fallback OTP
        note: "Check backend console for OTP"
      });
    }
  } catch (error) {
    console.error("Error in resendOTP:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
