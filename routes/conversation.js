const express = require("express");
const router = express.Router();
const {
  getConversations,
  getMessagesByWaId,
  sendMessage,
} = require("../controllers/messageController");

router.get("/", getConversations);
router.get("/:wa_id/messages", getMessagesByWaId);
router.post("/:wa_id/messages", sendMessage);

module.exports = router;
