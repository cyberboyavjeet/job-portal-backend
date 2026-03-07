const express = require("express");
const router = express.Router();
const Application = require("../models/Application");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Apply for job (worker)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const exists = await Application.findOne({ job: req.body.jobId, worker: req.user.id });
    if (exists) return res.status(400).json({ message: "Already applied" });

    const app = await Application.create({ job: req.body.jobId, worker: req.user.id });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my applications (worker)
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const apps = await Application.find({ worker: req.user.id }).populate("job");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all applications (admin)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const apps = await Application.find().populate("job").populate("worker", "-password");
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application status (admin)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;