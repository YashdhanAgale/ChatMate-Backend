require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const webhookRoutes = require("./routes/webhook");
const convoRoutes = require("./routes/conversation");
const { errorHandler } = require("./middlewares/errorHandler");

connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());

app.use("/api", webhookRoutes);
app.use("/api/conversations", convoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
