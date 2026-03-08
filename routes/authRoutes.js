const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const sendOTP = require("../utils/sendEmail");

// Send OTP
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });
    await sendOTP(email, otp);

    res.json({ message: "OTP sent to your email!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Verify OTP + Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, skills, experience, otp } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP expired! Request new one" });
    if (otpRecord.otp !== otp) return res.status(400).json({ message: "Wrong OTP!" });

    // Password validation
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    if (!/[A-Z]/.test(password)) return res.status(400).json({ message: "Password must have at least one uppercase letter" });
    if (!/[0-9]/.test(password)) return res.status(400).json({ message: "Password must have at least one number" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed,
      role: "worker", skills, experience, phone
    });

    await OTP.deleteMany({ email });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;