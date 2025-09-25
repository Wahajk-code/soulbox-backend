const express = require("express");
const router = express.Router();
const submissionService = require("../services/submission");
const webflowService = require("../services/webflow");

router.post("/submit", async (req, res) => {
  try {
    const submission = req.body;
    await submissionService.saveSubmission(submission);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error saving submission:", error);
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

router.post("/mailchimp", async (req, res) => {
  try {
    console.log("Mailchimp submission:", req.body);
    res.json({ ok: true });
  } catch (error) {
    console.error("Error submitting to Mailchimp:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/checkout", async (req, res) => {
  try {
    // Placeholder: Replace with Stripe API integration
    console.log("Checkout request:", req.body);
    res.json({ ok: true, sessionId: "mock_session_id" });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
