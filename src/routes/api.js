const express = require("express");
const router = express.Router();
const submissionService = require("../services/submission");
const webflowService = require("../services/webflow");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { google } = require("googleapis"); // ← ADD THIS LINE
require("dotenv").config();

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY.split("-")[1],
});

// ──────────────────────────────────────────────────────────────
// Arc calculation function (unchanged)
// ──────────────────────────────────────────────────────────────
function calcArc({ temperature, posture, yearning }) {
  const labelMap = {
    "Healing / Rebirth": "Heal and Rebirth",
    "Belonging / Connection": "Belong",
    "Liberation / Reckoning": "Liberty",
    "Becoming": "Becoming",
    "Acceptance": "Acceptance",
    "Redemption": "Redemption",
    "Exploration / Awakening": "Horizon",
    "Mastery": "Mastery",
    "Harmony / Sustaining": "Keeper",
    "Confronting the Shadow": "Confronting the Shadow",
  };
  // ... [all your existing rules – unchanged] ...
  const r1Temps = new Set(["Ashamed", "Bitter", "Numb", "Anxious"]);
  const r1Posts = new Set(["Guarded", "People-Pleasing"]);
  const r1Yearn = new Set(["To belong", "To be loved", "To be seen"]);
  if ((r1Temps.has(temperature) || r1Posts.has(posture)) && r1Yearn.has(yearning)) {
    const arc = "Confronting the Shadow";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 1 — Internal Barrier" };
  }
  if (temperature === "Grieving") {
    const arc = "Healing / Rebirth";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 2 — Grieving" };
  }
  if (temperature === "Numb" && (yearning === "To feel worthy" || yearning === "To feel peace")) {
    const arc = "Healing / Rebirth";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 2 — Numb + (Worthy/Peace)" };
  }
  if (temperature === "Ashamed" && yearning === "To feel worthy") {
    const arc = "Healing / Rebirth";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 2 — Ashamed + Worthy" };
  }
  if (temperature === "Ashamed" && yearning === "To redeem") {
    const arc = "Redemption";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 2 — Ashamed + Redeem" };
  }
  if (posture === "Rebellious" && yearning === "To change") {
    const arc = "Liberation / Reckoning";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Rebellious + Change" };
  }
  if (posture === "Rebellious" && yearning === "To feel peace") {
    if (["Anxious", "Restless"].includes(temperature)) {
      const arc = "Liberation / Reckoning";
      return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Rebellious + Peace + Anxious/Restless" };
    }
    if (["Grieving", "Numb"].includes(temperature)) {
      const arc = "Acceptance";
      return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Rebellious + Peace + Grieving/Numb" };
    }
  }
  if (posture === "Resigned" && (yearning === "To be free" || yearning === "To change")) {
    if (["Grieving", "Numb", "Ashamed", "Bitter", "Anxious"].includes(temperature)) {
      const arc = "Healing / Rebirth";
      return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Resigned + (Free/Change) + heavy temps" };
    }
    if (["Hopeful", "Searching", "Restless"].includes(temperature)) {
      const arc = "Becoming";
      return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Resigned + (Free/Change) + light temps" };
    }
  }
  if (posture === "Controlling" && yearning === "To be free") {
    const arc = "Liberation / Reckoning";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Controlling + Free" };
  }
  if (posture === "Controlling" && yearning === "To feel peace") {
    const arc = "Acceptance";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Controlling + Peace" };
  }
  if (posture === "People-Pleasing" && yearning === "To feel worthy") {
    const arc = "Becoming";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — People-Pleasing + Worthy" };
  }
  if (posture === "Controlling" && yearning === "To belong") {
    const arc = "Acceptance";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 3 — Controlling + Belong" };
  }
  if ((["Restless", "Searching", "Anxious"].includes(temperature) || posture === "Seeker") &&
      (yearning === "To change" || yearning === "To discover" || yearning === "To be free")) {
    const arc = (yearning === "To discover") ? "Exploration / Awakening" : "Liberation / Reckoning";
    return { system: arc, label: labelMap[arc], rule_fired: "Rule 4 — Energy of Motion" };
  }
  const baseline = {
    "To feel worthy": "Healing / Rebirth",
    "To be loved": "Belonging / Connection",
    "To be free": "Liberation / Reckoning",
    "To be seen": "Becoming",
    "To feel peace": "Acceptance",
    "To belong": "Belonging / Connection",
    "To change": "Becoming",
    "To redeem": "Redemption",
    "To discover": "Exploration / Awakening",
    "To leave an impact": "Mastery",
    "To preserve": "Harmony / Sustaining",
  };
  const arc = baseline[yearning];
  return { system: arc, label: labelMap[arc], rule_fired: "Baseline" };
}

// ──────────────────────────────────────────────────────────────
// Existing routes (unchanged)
// ──────────────────────────────────────────────────────────────
router.post("/calculate-arc", async (req, res) => {
  try {
    const { temperature, posture, yearning } = req.body;
    console.log(`[API] Calculating arc: ${temperature}-${posture}-${yearning}`);
    if (!temperature || !posture || !yearning) {
      return res.status(400).json({ ok: false, error: "Missing required fields" });
    }
    const arc = calcArc({ temperature, posture, yearning });
    res.json(arc);
  } catch (error) {
    console.error("[API] Error calculating arc:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/submit", async (req, res) => {
  try {
    let submission = req.body;
    if (submission.quizState) {
      submission = { ...submission.quizState, submitted_at: new Date().toISOString() };
    } else {
      submission.submitted_at = new Date().toISOString();
    }
    await submissionService.saveSubmission(submission);
    res.json({ ok: true });
  } catch (error) {
    console.error("Submission failed:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/soul-report/:arcLabel", async (req, res) => {
  try {
    const { arcLabel } = req.params;
    const report = await webflowService.getSoulReport(arcLabel);
    res.json(report);
  } catch (error) {
    console.error("Error fetching soul report:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { email, product } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{
        price_data: {
          currency: product.currency,
          product_data: { name: product.name },
          unit_amount: product.amount,
          ...(product.recurring && { recurring: product.recurring }),
        },
        quantity: 1,
      }],
      mode: product.recurring ? "subscription" : "payment",
      success_url: `${req.headers.origin}/thank-you-purchase?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/triad-reveal`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/mailchimp-subscribe", async (req, res) => {
  try {
    const { email, tags = ["Waitlist"] } = req.body;
    if (!process.env.MAILCHIMP_AUDIENCE_ID || process.env.MAILCHIMP_AUDIENCE_ID === "xxxxxxxxxx") {
      throw new Error("Mailchimp Audience ID is not configured");
    }
    const response = await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
      email_address: email,
      status: "subscribed",
      tags,
    });
    res.json({ ok: true, id: response.id });
  } catch (error) {
    console.error("Mailchimp error:", error);
    res.status(500).json({ ok: false, error: error.response?.body?.title || error.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DEBUG SHEETS ROUTE – ADDED HERE
// ──────────────────────────────────────────────────────────────
router.get("/debug-sheets", async (req, res) => {
  // Simple protection – change or set via env
  const DEBUG_KEY = process.env.DEBUG_SHEETS_KEY || "test123";
  if (req.query.key !== DEBUG_KEY) {
    return res.status(401).json({ error: "Unauthorized – add ?key=YOUR_KEY" });
  }

  const logs = [];
  const log = (msg) => logs.push(`[${new Date().toISOString()}] ${msg}`);

  log("Starting Google Sheets connection debug...");

  // 1. Check env vars
  log(`GOOGLE_CLIENT_EMAIL: ${process.env.GOOGLE_CLIENT_EMAIL ? "OK" : "MISSING"}`);
  log(`GOOGLE_SHEET_ID: ${process.env.GOOGLE_SHEET_ID ? "OK" : "MISSING"}`);
  log(`SHEET_NAME: ${process.env.SHEET_NAME || "Responses (default)"}`);
  log(`GOOGLE_PRIVATE_KEY: ${!!process.env.GOOGLE_PRIVATE_KEY ? "Present" : "MISSING"}`);

  if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_SHEET_ID) {
    return res.status(500).json({ error: "Missing required env vars", logs });
  }

  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

  // 2. Authenticate
  let jwtClient;
  try {
    jwtClient = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      privateKey,
      ["https://www.googleapis.com/auth/spreadsheets"]
    );
    await jwtClient.authorize();
    log("Authentication successful");
  } catch (err) {
    log(`Authentication FAILED: ${err.message}`);
    return res.status(500).json({ logs });
  }

  const sheets = google.sheets({ version: "v4", auth: jwtClient });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.SHEET_NAME || "Responses";

  // 3. Test spreadsheet access
  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId });
    log(`Spreadsheet found: "${meta.data.properties.title}"`);
  } catch (err) {
    log(`Spreadsheet access FAILED: ${err.message}`);
    log("Fix: Share the Google Sheet with your service account email!");
    return res.status(500).json({ logs });
  }

  // 4. Test sheet tab
  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });
    log(`Sheet tab "${sheetName}" is readable`);
  } catch (err) {
    log(`Sheet tab "${sheetName}" FAILED: ${err.message}`);
    log("Fix: Check tab name spelling or share permissions");
    return res.status(500).json({ logs });
  }

  log("ALL TESTS PASSED – Google Sheets is 100% configured!");
  res.json({ success: true, logs });
});

// ──────────────────────────────────────────────────────────────
module.exports = router;
