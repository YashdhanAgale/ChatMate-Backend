const fs = require("fs");
const path = require("path");
const Message = require("../models/Message");

async function processSamplePayloads() {
  const payloadDir = path.join(__dirname, "../sample_payloads");
  const files = fs.readdirSync(payloadDir);

  for (const file of files) {
    const raw = fs.readFileSync(path.join(payloadDir, file), "utf8");
    let data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error(`Invalid JSON in file ${file}:`, err.message);
      continue;
    }

    const entries = data.metaData && data.metaData.entry;
    if (!entries || !Array.isArray(entries)) continue;

    for (const entry of entries) {
      const changes = entry.changes;
      if (!changes || !Array.isArray(changes)) continue;

      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        const contacts = value.contacts || [];
        const messaging = value.messages || [];

        for (const msg of messaging) {
          const msgId = msg.id || msg.message_id || msg.mid;
          const waId = contacts[0]?.wa_id || msg.from;
          const text = msg.text?.body || msg.message || "";
          const ts = msg.timestamp
            ? new Date(Number(msg.timestamp) * 1000)
            : new Date();

          try {
            await Message.findOneAndUpdate(
              { msg_id: msgId },
              {
                $setOnInsert: {
                  msg_id: msgId,
                  meta_msg_id: msgId,
                  wa_id: waId,
                  from: msg.from,
                  to: msg.to || value.metadata?.display_phone_number,
                  text,
                  timestamp: ts,
                  status: { type: "sent", updatedAt: ts },
                },
              },
              { upsert: true, new: true }
            );
          } catch (err) {
            console.error(`Error upserting message ${msgId}:`, err.message);
          }
        }

        if (value.statuses && Array.isArray(value.statuses)) {
          for (const status of value.statuses) {
            const relatedId = status.id;
            const newStatus = status.status;
            const statusTs = status.timestamp
              ? new Date(Number(status.timestamp) * 1000)
              : new Date();
            try {
              await Message.findOneAndUpdate(
                { msg_id: relatedId },
                {
                  $set: {
                    "status.type": newStatus,
                    "status.updatedAt": statusTs,
                  },
                }
              );
            } catch (err) {
              console.error(
                `Error updating status for ${relatedId}:`,
                err.message
              );
            }
          }
        }
      }
    }
  }
}

module.exports = { processSamplePayloads };
