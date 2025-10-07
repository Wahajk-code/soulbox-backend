const { google } = require("googleapis");
const sheets = google.sheets("v4");

// Authenticate with Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Define exact headers for the Responses sheet
const HEADERS = [
  "submitted_at",
  "name",
  "email",
  "country",
  "region",
  "arc.system",
  "arc.label",
  "arc.rule_fired",
  "desire.genre_calling",
  "desire.genre_flavour",
  "desire.genre_subflavour",
  "desire.tone",
  "desire.pacing",
  "desire.literary_depth",
  "desire.plot_bias",
  "desire.sensitivity",
  "cultural_lens.axis_tradition_change",
  "cultural_lens.whose_story",
  "cultural_lens.protagonist_lens",
  "cultural_lens.aggregate",
  "soul_climate.temperature_primary.tag",
  "soul_climate.temperature_primary.whisper_text",
  "soul_climate.temperature_secondary.tag",
  "soul_climate.temperature_secondary.image_id",
  "soul_climate.posture.final",
  "soul_climate.posture.path.q9a",
  "soul_climate.posture.path.q9b",
  "yearning.cluster_image",
  "yearning.final",
  "yearning.whisper_confirm",
  "reader_context.favourite_books",
  "reader_context.themes_issues",
  "reader_context.heavy_triggers",
];

// Flatten nested objects (e.g., { arc: { system: 'Healing / Rebirth' } } → { 'arc.system': 'Healing / Rebirth' })
function flattenObject(obj, prefix = "") {
  const flat = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flat, flattenObject(value, newKey));
    } else {
      flat[newKey] = Array.isArray(value) ? JSON.stringify(value) : value;
    }
  }
  return flat;
}

async function saveSubmission(submission) {
  try {
    const sheetsClient = await auth.getClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.SHEET_NAME || "Responses";
    const range = `${sheetName}!A:AG`; // 33 columns (A to AG)

    // Flatten submission data
    const flattened = flattenObject(submission);
    flattened.submitted_at = new Date().toISOString(); // Use submitted_at as per headers
    flattened.region = flattened.region || flattened.country; // Mirror country to region if not set

    // Check if sheet has headers; add if missing
    const existing = await sheets.spreadsheets.values
      .get({
        auth: sheetsClient,
        spreadsheetId,
        range: `${sheetName}!A1:AG1`,
      })
      .catch(() => null);

    if (
      !existing ||
      !existing.data.values ||
      existing.data.values.length === 0 ||
      existing.data.values[0].length === 0
    ) {
      console.log("[SubmissionService] Writing headers to Responses sheet");
      await sheets.spreadsheets.values.update({
        auth: sheetsClient,
        spreadsheetId,
        range: `${sheetName}!A1:AG1`,
        valueInputOption: "RAW",
        resource: { values: [HEADERS] },
      });
    }

    // Prepare row in the exact order of HEADERS
    const row = HEADERS.map((header) => flattened[header] || "");
    console.log("[SubmissionService] Appending submission row", {
      email: "[REDACTED]",
      submitted_at: flattened.submitted_at,
      arc_label: flattened["arc.label"],
    });

    // Append row
    await sheets.spreadsheets.values.append({
      auth: sheetsClient,
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values: [row] },
    });

    console.log("[SubmissionService] Submission saved successfully");
  } catch (error) {
    console.error(
      "[SubmissionService] Failed to save submission to Google Sheets:",
      error.message,
      error.stack
    );
    // Do not throw error to allow user flow to continue
  }
}

module.exports = { saveSubmission };
