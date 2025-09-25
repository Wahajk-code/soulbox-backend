const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const apiRoutes = require("./routes/api");

// Load .env from project root (for local dev only)
dotenv.config({ path: __dirname + "/../.env" });

const app = express();

// Enable CORS for Webflow origin
app.use(
  cors({
    origin: "https://soul-box.webflow.io",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use("/api", apiRoutes);

// Health check / root route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "SoulBox backend is running" });
});

module.exports = app;

// ❌ Don't call app.listen() here
// ✅ Just export app for Vercel
module.exports = app;
