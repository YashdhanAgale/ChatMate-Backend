const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const { processSamplePayloads } = require("../utils/processPayloads");

async function main() {
  await connectDB();
  await processSamplePayloads();
  console.log("All payloads processed ✅");
  mongoose.connection.close();
}

main().catch((err) => {
  console.error("Error:", err);
  mongoose.connection.close();
});
