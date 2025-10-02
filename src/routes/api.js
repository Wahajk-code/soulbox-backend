const express = require("express");
const router = express.Router();
const submissionService = require("../services/submission");
const webflowService = require("../services/webflow");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const mailchimp = require("@mailchimp/mailchimp_marketing");

// Configure Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_API_KEY.split("-")[1], // Extracts 'us10'
});


router.get("/debug/cms-records", async (req, res) => {
  try {
    const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;
    const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID;
    const BASE_URL = "https://api.webflow.com/v2";

    const response = await fetch(
      `${BASE_URL}/collections/${COLLECTION_ID}/items`,
      {
        headers: {
          Authorization: `Bearer ${WEBFLOW_API_KEY}`,
          "accept-version": "1.0.0",
        },
      }
    );

    const data = await response.json();
    res.json({
      ok: true,
      items: data.items.map((item) => ({
        arc_key: item.fieldData.arc_key,
        arc_label: item.fieldData.arc_label,
        slug: item.fieldData.slug,
        name: item.fieldData.name,
      })),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});



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

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { email, product } = req.body; // product: { name, amount (in cents/pence), currency, recurring? }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: { name: product.name },
            unit_amount: product.amount, // e.g., 5500 for £55
            ...(product.recurring && { recurring: product.recurring }),
          },
          quantity: 1,
        },
      ],
      mode: product.recurring ? "subscription" : "payment",
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/three-book-reveal`,
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
        tags: tags,
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

module.exports = router;
