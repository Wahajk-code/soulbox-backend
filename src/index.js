const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const apiRoutes = require("./routes/api");

// Load .env from project root
dotenv.config({ path: __dirname + "/../.env" });

const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("API_KEY:", process.env.WEBFLOW_API_KEY ? "****" : "not set");
  console.log(
    "COLLECTION_ID:",
    process.env.WEBFLOW_COLLECTION_ID || "undefined"
  );
});
