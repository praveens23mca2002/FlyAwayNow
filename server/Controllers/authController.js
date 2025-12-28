const User = require("../models/usersModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PasswordReset = require("../models/passwordResetModel");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const validator = require("validator"); 

require("dotenv").config();

// Nodemailer transporter setup
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// transporter verification
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

// Helper function to validate email format
const validateEmail = (email) => {
  return validator.isEmail(email);
};

// Register new user
const CreateUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).send({
        message: "Invalid email format.",
        success: false,
      });
    }

  
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        message: "User already exists.",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 6);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    res.status(201).send({
      message: "User created successfully.",
      success: true,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

// Login user
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).send({
        message: "User does not exist.",
        success: false,
      });
    }

    // Validate the password
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).send({
        message: "Incorrect password.",
        success: false,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: existingUser._id, role:existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).send({
      message: "You have logged in successfully.",
      success: true,
      data: token,
      user: existingUser,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

// Reset password
const ResetPassword = async (req, res) => {
  const { email } = req.body;
  const redirectUrl = "http://localhost:3000/reset-password"; 

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({
        status: "FAILED",
        message: "Email does not exist.",
      });
    }

    // Generate a reset string
    const resetString = uuidv4() + user._id;
    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset",
      html: `
        Hello ${user.name},
        <br/>
        <br/>
        Please click on the link below to reset your password:
        <br/>
        <br/>
        <a href="${redirectUrl}/${user._id}/${resetString}">Reset Password</a>
        <br/>
        <br/>
        If you did not request this, please ignore this email.
        <br/>
        <br/>
        Thank you.
      `,
    };

    // Hash the reset string
    const hashedResetString = await bcrypt.hash(resetString, 10);

    // Save the password reset record
    const newPasswordReset = new PasswordReset({
      userId: user._id,
      resetString: hashedResetString,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000, // 1 hour expiry
    });

    await newPasswordReset.save();
    await transporter.sendMail(mailOptions);

    res.status(200).send({
      status: "PENDING",
      message: "Password reset email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "FAILED",
      message: "Something went wrong.",
    });
  }
};

// Update password
const UpdatePassword = async (req, res) => {
  const { userId, resetString } = req.params;
  const { newPassword } = req.body;

  try {
    // Check if reset record exists and if link is expired
    const resetRecord = await PasswordReset.findOne({ userId });
    if (!resetRecord || resetRecord.expiresAt < Date.now()) {
      return res.status(410).send({
        status: "FAILED",
        message: "Password reset link has expired.",
      });
    }

    // Validate the reset string
    const isResetStringValid = await bcrypt.compare(resetString, resetRecord.resetString);
    if (!isResetStringValid) {
      return res.status(400).send({
        status: "FAILED",
        message: "Invalid password reset details.",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: userId }, { password: hashedNewPassword });
    await PasswordReset.deleteOne({ userId }); // Delete the reset record

    res.status(200).send({
      status: "SUCCESS",
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "FAILED",
      message: "An error occurred while updating the password.",
    });
  }
};

module.exports = { CreateUser, Login, ResetPassword, UpdatePassword };
