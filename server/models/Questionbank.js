const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    optionA: {
      type: String,
      required: true,
      trim: true,
    },
    optionB: {
      type: String,
      required: true,
      trim: true,
    },
    optionC: {
      type: String,
      required: true,
      trim: true,
    },
    optionD: {
      type: String,
      required: true,
      trim: true,
    },
    correctAnswer: {
      type: String,
      required: true,
      uppercase: true,
      enum: ["A", "B", "C", "D"],
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    sourceType: {
      type: String,
      default: "manual",
      trim: true,
    },
    sourceFileName: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);
