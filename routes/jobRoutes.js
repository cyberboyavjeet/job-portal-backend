const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// Get all jobs (public)
router.get("/", async (req, res) => {
  try {
    const { search, location, category } = req.query;
    let filter = { status: "open" };
    if (search) filter.title = { $regex: search, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (category) filter.category = category;

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Post job (admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update job (admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete job (admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;