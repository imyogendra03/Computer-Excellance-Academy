const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
    examineeId: { type: mongoose.Schema.Types.ObjectId, ref: "Examinee", default: null },
    senderName: { type: String, default: "" },
    senderEmail: { type: String, default: "" },
    senderPhone: { type: String, default: "" },
    source: {
      type: String,
      enum: ["user-chat", "public-support"],
      default: "user-chat",
    },
    deletedBy: { type: String, enum: ["admin", "user", null], default: null },
    editedBy: { type: String, enum: ["admin", "user", null], default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
