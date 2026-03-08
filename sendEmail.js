const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"JobPortal" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP for JobPortal Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: white; padding: 2rem; border-radius: 12px;">
        <h2 style="color: #00d4ff; text-align: center;">💼 JobPortal</h2>
        <h3 style="text-align: center;">Email Verification</h3>
        <p style="color: #aaa; text-align: center;">Use the OTP below to verify your email address</p>
        <div style="background: #0f3460; padding: 1.5rem; border-radius: 8px; text-align: center; margin: 2rem 0;">
          <h1 style="color: #00d4ff; font-size: 3rem; letter-spacing: 10px;">${otp}</h1>
        </div>
        <p style="color: #aaa; text-align: center; font-size: 0.85rem;">This OTP expires in 5 minutes</p>
        <p style="color: #e74c3c; text-align: center; font-size: 0.85rem;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOTP;
