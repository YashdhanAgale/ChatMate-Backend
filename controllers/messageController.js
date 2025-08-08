
const Message = require("../models/Message");
const { processSamplePayloads } = require("../utils/processPayloads");

exports.webhookHandler = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("Webhook received:", JSON.stringify(payload, null, 2));

    await processSamplePayloads(payload);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.aggregate([
      {
        $addFields: {
          contactId: {
            $cond: {
              if: { $eq: ["$from", "918329446654"] },
              then: "$to",
              else: "$from",
            },
          },
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: "$contactId",
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          lastMsgId: { $first: "$msg_id" },
          from: { $first: "$from" },
          to: { $first: "$to" },
          wa_id: { $first: "$wa_id" },
        },
      },
      {
        $project: {
          _id: 0,
          wa_id: "$_id",
          from: 1,
          to: 1,
          lastMessage: 1,
          lastTimestamp: 1,
          lastMsgId: 1,
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
    ]);

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

exports.getMessagesByWaId = async (req, res, next) => {
  try {
    const { wa_id } = req.params;
    const messages = await Message.find({ wa_id }).sort("timestamp");
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { wa_id } = req.params;
    const { text } = req.body;
    const newMsg = await Message.create({
      msg_id: Date.now().toString(), // or UUID
      wa_id,
      from: process.env.PLATFORM_NUMBER,
      to: wa_id,
      text,
      timestamp: new Date(),
      status: { type: "sent", updatedAt: new Date() },
    });
    res.status(201).json(newMsg);
  } catch (err) {
    next(err);
  }
};
