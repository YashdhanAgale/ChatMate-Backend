const mongoose = require("mongoose");
const MessageSchema = new mongoose.Schema(
  {
    msg_id: { type: String, required: true, unique: true },
    meta_msg_id: { type: String },
    wa_id: { type: String, required: true },
    from: { type: String },
    to: { type: String },
    text: { type: String },
    timestamp: { type: Date },
    status: {
      type: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
      },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Message", MessageSchema);
