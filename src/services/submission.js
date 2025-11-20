const { google } = require("googleapis");
const sheets = google.sheets("v4");
const privateKey = `
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDnu4ExfAGnLNy+
oF/vMBOBfmOPcaq/qtNgCbuhe5S9+r+oCF5hf5ywZJx0oZZuHeT0GTv9pb62uQ7C
zN09TLHV/VLRxF+GDARDb/4kyq8BjvRXMJW11aaGfXkK1ZTZj2GH/W9ETdJt3Fio
umDLVpEwO3C+OlVEAssbF/9KxHUx8V+ezjapY4C8Mv1MzcQ9s2I1z3AIIrx+95Ip
V2tv/wP6JP679mouq3Jaw0SuONuLzqRJ3Llq+yASO9aDgJPtqrQifK0nOeU+QHnQ
EacL6GOu4+WIM9gTNQZXWtFQWMC9aD7jHzhiRtNnlVd9FqpU0kaP5d/wECBsbfLl
5V/b3FmNAgMBAAECggEABiEmDi6HBqp/nkU0tGlzoqG6tXEewJoepDQts9xGd236
AtJR2Mdc2CeZIdaiWYBN7Yz7Ur6/GCs18j4j/fqY252rQqQsmKmZtUTxlnyL+4ES
AnplA13G3VjVSk2S9dw+iq/P8SET11cUO0ZOyCIejgWMemOlnLpsL+fHF22x4ePB
LeLAdUlnLoGjepZilZomEVZPe2oyXh9SulTE4YT+Numg8hP4zOu4/eeYu3ONsY+f
tTWc5TyuIhPn3LQKRH+PllEM0PJUkDlpqmIWp+gKeGpDNp5U71MFXq36uAOEi9Gc
f5Dz+HrfA0BfzI1Gzx/CRxM6dpIQARQIRodfrw1WewKBgQD44bJoz9z6NK9+MQ7B
nrw/IA7zcd3BuzKpj7tDa+7BYcSdquALgMOU1RXD3f2mkd/6idvuaQ0ml19jngF3
bvv/qkRWqwtUb7kaa6FlOahjE7q7A6meuP7M4O+RF0Etkfy21YE4OVc2LaxeEIr3
gI5b9myClNMBUgy16RG0w9M7wwKBgQDuXD3w1/7QYbwPNXZTxZ9kI6bRP0K5ADcV
/P9wQv41dz7zdYVLRocTQhoZpzVaLJziMAsdbyBaGN733VCY1YrhYcCy7pxc48xH
3ildqMwX3zS9ZrPJnGDNCYdTIHf/9Wuh3uJewfQxehfH45AmQRgSDdfyZK+1ayeE
h1Osgf3QbwKBgQCMSjzVFAaOC1C5I1IcFiwqsRl8ZL0JzUm7hseaM6b73u6DqaRt
F4InzQ1dwS6PzD6i7T7J3vGIxV8Bujk9Z5QpA4NOD1BtoiSHHhB2DNA8OQzTCjd8
vu7x8gFYmfEljNsU/LjARqJAafJ1e4G6Df8xG3EDEnz2i5eamuxeJtxVHQKBgCeM
kpJ1pEf7D3MOkdWQgsPgznsFnhKIIJu7YL7FvtwsLvvCUh2NVDgzzZTYE5gkstss
0YtOtvV8DvLde9QACo0e5RRLVxJqkaiTChYKPeLwHBYZBle7ZKxgml2Gk6KanAM9
sh263MOg2HVIItDWGCJWva/wWN8nKmVo9s82umBtAoGAHGOrMhXoZTCwE7isoBE2
+1D3Rk1c1dmX+OdmwUEUOOTEBwlKg45Enlb4zESH+No69YzK7PZjU/jOtlAkhGUA
F5huQtW9YciaZZhX+vpqIiU9PDE/VDmoZr6cDYu6gm4kQ4Ax2zkkEMFQdYc0EMHL
xq3f1QWxhDyPyNy8VGs+hFA=
-----END PRIVATE KEY-----
`;  
// Authenticate with Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: privateKey,
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
  "cultural_lens.axis_tradition_change.value",
  "cultural_lens.whose_story.value",
  "cultural_lens.protagonist_lens.value",
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
    // Validate required fields
    if (!submission || !submission.email || !submission.country) {
      console.error("[SubmissionService] Invalid submission: missing required fields", { submission });
      return;
    }

    const sheetsClient = await auth.getClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.SHEET_NAME || "Responses";
    const range = `${sheetName}!A:AG`; // 33 columns (A to AG)

    // Flatten submission data
    const flattened = flattenObject(submission);
    flattened.submitted_at = new Date().toISOString(); // Set timestamp
    flattened.region = flattened.region || flattened.country; // Mirror country to region

    // Check if sheet has headers; add if missing
    const existing = await sheets.spreadsheets.values.get({
      auth: sheetsClient,
      spreadsheetId,
      range: `${sheetName}!A1:AG1`,
    }).catch(() => null);

    if (!existing || !existing.data.values || existing.data.values.length === 0) {
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
    console.error("[SubmissionService] Failed to save submission to Google Sheets:", error.message);
  }
}

module.exports = { saveSubmission };
