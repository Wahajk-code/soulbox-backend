const express = require("express");
const router = express.Router();
const submissionService = require("../services/submission");
const webflowService = require("../services/webflow");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mailchimp = require("@mailchimp/mailchimp_marketing");
const { google } = require("googleapis"); // ← ADD THIS LINE
require("dotenv").config();
const crypto = require("crypto");

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY.split("-")[1],
});
const PLANS = {
  monthly: {
    type: "inline", // temporary
    mode: "subscription",
  },
  bimonthly: {
    type: "price",
    priceId: "price_1SgpfCFHbt8VjRVzdlSvDSTn",
    mode: "subscription",
  },
  onetime: {
    type: "price",
    priceId: "price_1SgpeSFHbt8VjRVzkuAj13DD",
    mode: "payment",
  },
};
// ──────────────────────────────────────────────────────────────
// Arc calculation function (unchanged)
// ──────────────────────────────────────────────────────────────
function calcArc({ temperature, posture, yearning }) {
  const labelMap = {
    "Healing / Rebirth": "Heal and Rebirth",
    "Belonging / Connection": "Belong",
    "Liberation / Reckoning": "Liberty",
    Becoming: "Becoming",
    Acceptance: "Acceptance",
    Redemption: "Redemption",
    "Exploration / Awakening": "Horizon",
    Mastery: "Mastery",
    "Harmony / Sustaining": "Keeper",
    "Confronting the Shadow": "Confronting the Shadow",
  };
  // ... [all your existing rules – unchanged] ...
  const r1Temps = new Set(["Ashamed", "Bitter", "Numb", "Anxious"]);
  const r1Posts = new Set(["Guarded", "People-Pleasing"]);
  const r1Yearn = new Set(["To belong", "To be loved", "To be seen"]);
  if (
    (r1Temps.has(temperature) || r1Posts.has(posture)) &&
    r1Yearn.has(yearning)
  ) {
    const arc = "Confronting the Shadow";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 1 — Internal Barrier",
    };
  }
  if (temperature === "Grieving") {
    const arc = "Healing / Rebirth";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 2 — Grieving",
    };
  }
  if (
    temperature === "Numb" &&
    (yearning === "To feel worthy" || yearning === "To feel peace")
  ) {
    const arc = "Healing / Rebirth";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 2 — Numb + (Worthy/Peace)",
    };
  }
  if (temperature === "Ashamed" && yearning === "To feel worthy") {
    const arc = "Healing / Rebirth";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 2 — Ashamed + Worthy",
    };
  }
  if (temperature === "Ashamed" && yearning === "To redeem") {
    const arc = "Redemption";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 2 — Ashamed + Redeem",
    };
  }
  if (posture === "Rebellious" && yearning === "To change") {
    const arc = "Liberation / Reckoning";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 3 — Rebellious + Change",
    };
  }
  if (posture === "Rebellious" && yearning === "To feel peace") {
    if (["Anxious", "Restless"].includes(temperature)) {
      const arc = "Liberation / Reckoning";
      return {
        system: arc,
        label: labelMap[arc],
        rule_fired: "Rule 3 — Rebellious + Peace + Anxious/Restless",
      };
    }
    if (["Grieving", "Numb"].includes(temperature)) {
      const arc = "Acceptance";
      return {
        system: arc,
        label: labelMap[arc],
        rule_fired: "Rule 3 — Rebellious + Peace + Grieving/Numb",
      };
    }
  }
  if (
    posture === "Resigned" &&
    (yearning === "To be free" || yearning === "To change")
  ) {
    if (
      ["Grieving", "Numb", "Ashamed", "Bitter", "Anxious"].includes(temperature)
    ) {
      const arc = "Healing / Rebirth";
      return {
        system: arc,
        label: labelMap[arc],
        rule_fired: "Rule 3 — Resigned + (Free/Change) + heavy temps",
      };
    }
    if (["Hopeful", "Searching", "Restless"].includes(temperature)) {
      const arc = "Becoming";
      return {
        system: arc,
        label: labelMap[arc],
        rule_fired: "Rule 3 — Resigned + (Free/Change) + light temps",
      };
    }
  }
  if (posture === "Controlling" && yearning === "To be free") {
    const arc = "Liberation / Reckoning";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 3 — Controlling + Free",
    };
  }
  if (posture === "Controlling" && yearning === "To feel peace") {
    const arc = "Acceptance";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 3 — Controlling + Peace",
    };
  }
  if (posture === "People-Pleasing" && yearning === "To feel worthy") {
    const arc = "Becoming";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 3 — People-Pleasing + Worthy",
    };
  }
  if (posture === "Controlling" && yearning === "To belong") {
    const arc = "Acceptance";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 3 — Controlling + Belong",
    };
  }
  if (
    (["Restless", "Searching", "Anxious"].includes(temperature) ||
      posture === "Seeker") &&
    (yearning === "To change" ||
      yearning === "To discover" ||
      yearning === "To be free")
  ) {
    const arc =
      yearning === "To discover"
        ? "Exploration / Awakening"
        : "Liberation / Reckoning";
    return {
      system: arc,
      label: labelMap[arc],
      rule_fired: "Rule 4 — Energy of Motion",
    };
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
      return res
        .status(400)
        .json({ ok: false, error: "Missing required fields" });
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
      submission = {
        ...submission.quizState,
        submitted_at: new Date().toISOString(),
      };
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
    const { plan, email } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    const config = PLANS[plan];

    let line_items;

    // ✅ MONTHLY — inline price_data (temporary)
    if (config.type === "inline") {
      line_items = [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: "SoulBox — Monthly Journey",
            },
            unit_amount: 5500,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ];
    }

    // ✅ BIMONTHLY & ONETIME — price_id
    if (config.type === "price") {
      line_items = [
        {
          price: config.priceId,
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      ...(email && { customer_email: email }),
      mode: config.mode,
      line_items,
      success_url: `${req.headers.origin}/thank-you-purchase?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.originigin}/triad-reveal`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/mailchimp-subscribe", async (req, res) => {
  try {
    const { email, tags = ["Waitlist"] } = req.body;
    if (
      !process.env.MAILCHIMP_AUDIENCE_ID ||
      process.env.MAILCHIMP_AUDIENCE_ID === "xxxxxxxxxx"
    ) {
      throw new Error("Mailchimp Audience ID is not configured");
    }
    const response = await mailchimp.lists.addListMember(
      process.env.MAILCHIMP_AUDIENCE_ID,
      {
        email_address: email,
        status: "subscribed",
        tags,
      }
    );
    res.json({ ok: true, id: response.id });
  } catch (error) {
    console.error("Mailchimp error:", error);
    res
      .status(500)
      .json({ ok: false, error: error.response?.body?.title || error.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DEBUG SHEETS ROUTE – ADDED HERE
// ──────────────────────────────────────────────────────────────

router.get("/debug-sheets", async (req, res) => {
  const DEBUG_KEY = process.env.DEBUG_SHEETS_KEY || "test123";
  const logs = [];
  const fatal = (msg) => logs.push({ level: "fatal", msg });
  const info = (msg) => logs.push({ level: "info", msg });
  const warn = (msg) => logs.push({ level: "warn", msg });

  const sessionId = crypto.randomUUID();
  info(`Debug session started: ${sessionId}`);
  info(`Client IP: ${req.ip || req.headers["x-forwarded-for"]}`);

  // Security check
  if (req.query.key !== DEBUG_KEY) {
    fatal("Unauthorized – append ?key=YOUR_DEBUG_KEY");
    return res.status(401).json({ success: false, logs });
  }

  // Structured step 1: Validate ENV vars
  info("STEP 1 — Checking environment variables...");

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.SHEET_NAME || "Responses";

  info(`GOOGLE_CLIENT_EMAIL: ${clientEmail ? "OK" : "❌ MISSING"}`);
  info(`GOOGLE_SHEET_ID: ${sheetId ? "OK" : "❌ MISSING"}`);
  info(`SHEET_NAME: ${sheetName}`);
  info(`GOOGLE_PRIVATE_KEY: ${rawKey ? "Present" : "❌ MISSING"}`);

  if (!clientEmail || !rawKey || !sheetId) {
    fatal("Missing required env vars (client_email, private_key, sheet_id)");
    return res.status(500).json({ success: false, logs });
  }

  // Check for formatting issues
  if (rawKey.includes("-----BEGIN PRIVATE KEY-----") === false) {
    fatal("Private key does not include BEGIN/END lines — corrupted env var");
  }

  if (rawKey.includes("\n")) {
    warn(
      "Private key contains REAL newline characters — invalid for Vercel env vars"
    );
  }
  if (rawKey.includes("\\n")) {
    info("Private key contains escaped \\n — looks correct for Vercel format");
  }

  // Convert \n → real line breaks
  const privateKey = rawKey.replace(/\\n/g, "\n");

  // Validate key length
  if (privateKey.length < 1000) {
    warn(
      `Private key is suspiciously short (${privateKey.length} chars). Possible truncation.`
    );
  }

  info("STEP 2 — Authenticating with Google...");

  // Use lower-level JWT for clearer error reporting
  let jwtClient;
  try {
    jwtClient = new google.auth.JWT(clientEmail.trim(), null, privateKey, [
      "https://www.googleapis.com/auth/spreadsheets",
    ]);

    await jwtClient.authorize();
    info("✔ Authentication successful");
  } catch (err) {
    fatal(`❌ AUTH FAILED: ${err.message}`);
    if (err.message.includes("private key")) {
      warn("Likely caused by wrong formatting or invisible characters.");
    }
    if (err.message.includes("keyFile")) {
      warn("Your private key is EMPTY or NOT being passed correctly.");
    }
    return res.status(500).json({ success: false, logs });
  }

  const sheets = google.sheets({ version: "v4", auth: jwtClient });

  info("STEP 3 — Checking spreadsheet access...");

  try {
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    info(`✔ Spreadsheet found: "${meta.data.properties.title}"`);
  } catch (err) {
    fatal(`❌ Spreadsheet access FAILED: ${err.message}`);

    if (err.message.includes("403")) {
      warn("Your service account DOES NOT HAVE ACCESS to the Sheet.");
      warn(`Share this sheet with: ${clientEmail}`);
    }

    return res.status(500).json({ success: false, logs });
  }

  info("STEP 4 — Checking sheet tab access...");

  try {
    await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetName}!A1:Z1`,
    });

    info(`✔ Sheet tab "${sheetName}" is readable`);
  } catch (err) {
    fatal(`❌ Sheet tab "${sheetName}" FAILED: ${err.message}`);

    if (err.message.includes("Unable to parse range")) {
      warn("Tab name does NOT exist or contains hidden characters.");
    }

    return res.status(500).json({ success: false, logs });
  }

  info("🎉 ALL TESTS PASSED — Google Sheets is fully operational!");
  return res.json({ success: true, sessionId, logs });
});

// ──────────────────────────────────────────────────────────────
module.exports = router;
