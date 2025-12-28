const express = require("express");
const Feedback = require("../models/Feedback");
const router = express.Router();

// Submit feedback
router.post("/submit", async (req, res) => {
  try {
    const { userId, message, rating } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "User ID and message are required!" });
    }

    const feedback = new Feedback({
      userId,
      message,
      rating: rating || 0, // Default to 0 if no rating is provided
    });

    await feedback.save();

    res.status(201).json({ success: true, message: "Feedback submitted successfully!", data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all feedback (Admin only)
router.get("/all", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().populate("userId", "name email");
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;