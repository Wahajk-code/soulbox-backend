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

// Flatten nested objects (e.g., { desire: { genre_calling: 'Fantasy' } } → { 'desire.genre_calling': 'Fantasy' })
function flattenObject(obj, prefix = "") {
  const flat = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      Object.assign(flat, flattenObject(value, newKey));
    } else {
      flat[newKey] = Array.isArray(value) ? value.join(", ") : value;
    }
  }
  return flat;
}

async function saveSubmission(submission) {
  try {
    const sheetsClient = await auth.getClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.SHEET_NAME || "Sheet1";
    const range = `${sheetName}!A:Z`;

    // Flatten submission data
    const flattened = flattenObject(submission);
    const headers = Object.keys(flattened);
    flattened.timestamp = new Date().toISOString(); // Add timestamp
    headers.push("timestamp");

    // Check if sheet has headers; add if missing
    const existing = await sheets.spreadsheets.values
      .get({
        auth: sheetsClient,
        spreadsheetId,
        range: `${sheetName}!A1`,
      })
      .catch(() => null);

    if (
      !existing ||
      !existing.data.values ||
      existing.data.values.length === 0
    ) {
      await sheets.spreadsheets.values.update({
        auth: sheetsClient,
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: { values: [headers] },
      });
    }

    // Append row
    const row = headers.map((header) => flattened[header] || "");
    await sheets.spreadsheets.values.append({
      auth: sheetsClient,
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values: [row] },
    });
  } catch (error) {
    console.error(
      "Failed to save submission to Google Sheets:",
      error.message,
      error.stack
    );
    throw new Error("Failed to save submission: " + error.message);
  }
}

module.exports = { saveSubmission };
