const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: {
      favoriteTopics: [String],
      preferredDifficulty: { type: String, default: "Medium" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
