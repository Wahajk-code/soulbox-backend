const fetch = require("node-fetch");

async function getSoulReport(arcLabel) {
  const WEBFLOW_API_KEY = process.env.WEBFLOW_API_KEY;
  const COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID;
  const BASE_URL = "https://api.webflow.com/v2";

  if (!WEBFLOW_API_KEY || !COLLECTION_ID) {
    throw new Error("Missing WEBFLOW_API_KEY or WEBFLOW_COLLECTION_ID in .env");
  }

  try {
    const response = await fetch(
      `${BASE_URL}/collections/${COLLECTION_ID}/items`,
      {
        headers: {
          Authorization: `Bearer ${WEBFLOW_API_KEY}`,
          "accept-version": "1.0.0",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Webflow API response:", errorText);
      throw new Error(
        `Webflow API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
      throw new Error("Invalid response: items array not found");
    }

    // ✅ Match slug instead of name
    const report = data.items.find(
      (item) =>
        item.fieldData.slug &&
        item.fieldData.slug.toLowerCase() === arcLabel.toLowerCase()
    );

    if (!report) {
      throw new Error(`No report found for arcLabel: ${arcLabel}`);
    }

    return {
      arc_key: report.fieldData.slug,
      arc_label: report.fieldData.name,
      body: report.fieldData.body,
      footer: report.fieldData.footer,
    };
  } catch (error) {
    console.error("Webflow API fetch error:", error.message, error.stack);
    throw new Error("Failed to fetch soul report: " + error.message);
  }
}

module.exports = { getSoulReport };
