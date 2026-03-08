// Verify OTP + Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, skills, experience, otp } = req.body;

    // Verify OTP
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) return res.status(400).json({ message: "OTP expired! Request new one" });
    
    // Check expiry manually
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await OTP.deleteMany({ email });
      return res.status(400).json({ message: "OTP expired! Request new one" });
    }
    
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