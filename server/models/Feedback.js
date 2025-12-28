const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    message: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 }, // Star rating field
    createdAt: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);