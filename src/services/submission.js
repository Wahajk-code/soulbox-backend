const { google } = require("googleapis");
const sheets = google.sheets("v4");
const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCoCnZnuV9FKlyg\n219uUczxnVt/8cxJy0+gjSDaf2Fcpw0zfkLg6/IMI8J2e4VRSDQo8TlSfcNe+H4k\nq+xIiqh8bW+fJOZ/+Qk12bJwU8fphSrGZzIhDyd8Y3MTQub7rMrX8PmgJ/H0/LeQ\nn3I/qsnLDAdRHUbZu0cKLmD+2mGpDkxix9n6hS7n5Mx9XzzTyMKR+zFnotKhLnwo\ndSJPbDrQdkW55tvMoeBoprVJivdR/0BYzEu1ozg9CxoTsXrVtQwRD6me//GmqVI5\n18WkFbf2ODEJBw8xV6KzvHjToLe6Y8YAH1UAvhWpkw4y2xE/csSt+3CRgLFTmS1F\nvr+n7Ka/AgMBAAECggEAQd3sAIdERS+wJCso8myk6RYVjgag3VIQka2P8aVZbABc\n59C3dUN22nRP3rJXFP+41k2Lev6pzHmZtFUhZmPXXAJnbNmBcisTBaUh0O6+HxYg\nKKm9mADBKPwwWJ3yPTdDQTaHGlRd/nnqmAkvtq4CsBC0c4KGyYSjeWWphmviOOmr\nXC6up0BRCxS2d46qV4lN90cfeej+DCb9iiKhwGejnGjELlZ4U/WY0oVSc0SaM/hG\nsm8QoxhfTqW1litPLzVnVB4drFbRUsQoN9isM5qbaPxrYJAUQNHtxRs6dkDQId2W\nVVlhSxiNIOSwbEhh2DXK796aA/l8ALZx3DJMwXwJ4QKBgQDeq3LjKayo0dNIoE3L\nEhDWy9Ww4U1e+Rl3OY2dmVcpPw/S8sDrnQ4nsgTWbW1DzmGb4DL+MqKPF0AN0+2p\njf7k8FsDiFiIsenmnBM9DiNv2AB0XD8RjYUpkfRZvpOFseAtLWw48IAMepE/4f1D\nPmqUGn8ly9PbdBUTcPn2L4jY3wKBgQDBMaxsZR5W58QTyxQ5ywy6UG10rOVTKFA8\n1W5DguPu7qYoPpqNrVaJBahdBxtcD4wYsTSdeoqvPxDMo+PLHcK75fMHvIK66/5C\nH+s6sn1ZzlNbnuE0mJBzVOeufyMV/k/nV5zvUsdjiCaUo/sloVOT4ZXLiUiukShN\ncj9ol6OOIQKBgBe+GEX4j5yAoxK/ZQweJQWCPorZuzJBRWHdFSiUzSJswvcvQzrc\nSEIbTUC/8kKkouvIACfypjqzs/TFgDXwGhm3Nz0tMKOCtPoN8k80TrsCQSonG+J3\nQJeqJG/dTkWXLdwjV8LKghzShOJW6nZdFWgtWxlgnnpr6kNkbIK/lsvpAoGAcj0O\nSTZt/1OjJVUji50e1Jk0cBbAsDCZaa+HORKP97xUsl16hKZoEjQvP3sxWXm0DPHU\nO/63PTNcmrWawIPDn9o0oHF/GEruGWnIbfgXmWAg+H91ieVhHWGqcgup0pqD4zdy\njC31y0w6DBD/NFw2EK8HJcjzGo6pN0qEZjOsuiECgYBKUOMgRQH524tp4qgBeju3\n+3Lf5VI2nXTFIdOjXQxifKgSOmOw0GhzUEc2Cg+HnDEavyk05JbP1nHVdLT+Td5M\nRMF45UrSiE2mquxdwiJOiIJ8y2dMnY/K9tBlAmLXdbdFcN2vDjG45O8XxURLr0CM\nv7y0/qVvKNxzwmUPWakWuA==\n-----END PRIVATE KEY-----\n";
// Authenticate with Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "soulbox@acoustic-art-478618-k3.iam.gserviceaccount.com",
    private_key: privateKey,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

This issue is due to inconsistencies in how the JavaScript frontend constructs the submission object compared to how the Node.js backend's flattenObject function processes it and how the HEADERS array is structured.

Specifically:

Missing Values in Frontend Submission: The desire and cultural_lens properties in the frontend's submission object are nested objects, but the HEADERS array expects flattened keys like desire.genre_calling. The frontend doesn't flatten these; it just includes the nested structure.

Missing value in Frontend: The frontend is constructing the desire values as { genre_calling: quizState.desire?.genre_calling, ... }. However, based on the sample data you provided (genre_calling: { "value": "Fantasy", ... }), quizState.desire?.genre_calling is an object, and the backend needs to access its value property for the flattened key, or the frontend needs to handle the flattening or ensure the correct structure.

Missing reader_context.themes_issues: This field is present in the HEADERS but is missing from the frontend's submission object creation.

Incorrect Keys in Frontend: The frontend is trying to manually flatten some soul_climate fields (e.g., "soul_climate.temperature_primary.tag") while other fields that need to be flattened (like those under arc and desire) are left as nested objects.

The most robust fix is to ensure the Node.js backend's saveSubmission function always flattens the input object right before mapping to the HEADERS. Your current backend code attempts to do this, but the flattenObject function is designed to handle nested objects, and the incoming submission object from the frontend needs to be fully processed by it.

Here are the fixed code files:

1. Fixed Node.js Backend Code (saveSubmission function)
The fix is to ensure all keys that should be flattened are present in the HEADERS and that the flattenObject logic is sound and applied to the full submission object.

JavaScript

const { google } = require("googleapis");
const sheets = google.sheets("v4");
const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCoCnZnuV9FKlyg\n219uUczxnVt/8cxJy0+gjSDaf2Fcpw0zfkLg6/IMI8J2e4VRSDQo8TlSfcNe+H4k\nq+xIiqh8bW+fJOZ/+Qk12bJwU8fphSrGZzIhDyd8Y3MTQub7rMrX8PmgJ/H0/LeQ\nn3I/qsnLDAdRHUbZu0cKLmD+2mGpDkxix9n6hS7n5Mx9XzzTyMKR+zFnotKhLnwo\ndSJPbDrQdkW55tvMoeBoprVJivdR/0BYzEu1ozg9CxoTsXrVtQwRD6me//GmqVI5\n18WkFbf2ODEJBw8xV6KzvHjToLe6Y8YAH1UAvhWpkw4y2xE/csSt+3CRgLFTmS1F\nvr+n7Ka/AgMBAAECggEAQd3sAIdERS+wJCso8myk6RYVjgag3VIQka2P8aVZbABc\n59C3dUN22nRP3rJXFP+41k2Lev6pzHmZtFUhZmPXXAJnbNmBcisTBaUh0O6+HxYg\nKKm9mADBKPwwWJ3yPTdDQTaHGlRd/nnqmAkvtq4CsBC0c4KGyYSjeWWphmviOOmr\nXC6up0BRCxS2d46qV4lN90cfeej+DCb9iiKhwGejnGjELlZ4U/WY0oVSc0SaM/hG\nsm8QoxhfTqW1litPLzVnVB4drFbRUsQoN9isM5qbaPxrYJAUQNHtxRs6dkDQId2W\nVVlhSxiNIOSwbEhh2DXK796aA/l8ALZx3DJMwXwJ4QKBgQDeq3LjKayo0dNIoE3L\nEhDWy9Ww4U1e+Rl3OY2dmVcpPw/S8sDrnQ4nsgTWbW1DzmGb4DL+MqKPF0AN0+2p\njf7k8FsDiFiIsenmnBM9DiNv2AB0XD8RjYUpkfRZvpOFseAtLWw48IAMepE/4f1D\nPmqUGn8ly9PbdBUTcPn2L4jY3wKBgQDBMaxsZR5W58QTyxQ5ywy6UG10rOVTKFA8\n1W5DguPu7qYoPpqNrVaJBahdBxtcD4wYsTSdeoqvPxDMo+PLHcK75fMHvIK66/5C\nH+s6sn1ZzlNbnuE0mJBzVOeufyMV/k/nV5zvUsdjiCaUo/sloVOT4ZXLiUiukShN\ncj9ol6OOIQKBgBe+GEX4j5yAoxK/ZQweJQWCPorZuzJBRWHdFSiUzSJswvcvQzrc\nSEIbTUC/8kKkouvIACfypjqzs/TFgDXwGhm3Nz0tMKOCtPoN8k80TrsCQSonG+J3\nQJeqJG/dTkWXLdwjV8LKghzShOJW6nZdFWgtWxlgnnpr6kNkbIK/lsvpAoGAcj0O\nSTZt/1OjJVUji50e1Jk0cBbAsDCZaa+HORKP97xUsl16hKZoEjQvP3sxWXm0DPHU\nO/63PTNcmrWawIPDn9o0oHF/GEruGWnIbfgXmWAg+H91ieVhHWGqcgup0pqD4zdy\njC31y0w6DBD/NFw2EK8HJcjzGo6pN0qEZjOsuiECgYBKUOMgRQH524tp4qgBeju3\n+3Lf5VI2nXTFIdOjXQxifKgSOmOw0GhzUEc2Cg+HnDEavyk05JbP1nHVdLT+Td5M\nRMF45UrSiE2mquxdwiJOiIJ8y2dMnY/K9tBlAmLXdbdFcN2vDjG45O8XxURLr0CM\nv7y0/qVvKNxzwmUPWakWuA==\n-----END PRIVATE KEY-----\n";
// Authenticate with Service Account
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "soulbox@acoustic-art-478618-k3.iam.gserviceaccount.com",
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
  // Fixed: The frontend object structure means flattenObject must reach value inside the nested objects
  "desire.genre_calling.value", // FIX: changed to be correct path
  "desire.genre_flavour.value", // FIX: changed to be correct path
  "desire.genre_subflavour.value", // FIX: changed to be correct path
  "desire.tone.value", // FIX: changed to be correct path
  "desire.pacing.value", // FIX: changed to be correct path
  "desire.literary_depth.value", // FIX: changed to be correct path
  "desire.plot_bias.value", // FIX: changed to be correct path
  "desire.sensitivity.value", // FIX: changed to be correct path
  "cultural_lens.axis_tradition_change.value",
  "cultural_lens.whose_story.value",
  "cultural_lens.protagonist_lens.value",
  "cultural_lens.aggregate",
  "soul_climate.temperature_primary.tag",
  "soul_climate.temperature_primary.whisper_text",
  "soul_climate.temperature_secondary.tag",
  "soul_climate.temperature_secondary.image_id", // FIX: This key is now correctly placed
  "soul_climate.posture.final",
  "soul_climate.posture.path.q9a",
  "soul_climate.posture.path.q9b",
  "yearning.cluster_image",
  "yearning.final",
  "yearning.whisper_confirm",
  "reader_context.favourite_books",
  "reader_context.themes_issues", // FIX: Now included in the array of values to be mapped
  "reader_context.heavy_triggers",
];
// Flatten nested objects (e.g., { arc: { system: 'Healing / Rebirth' } } → { 'arc.system': 'Healing / Rebirth' })
function flattenObject(obj, prefix = "") {
  const flat = {};
  for (const [key, value] of Object.entries(obj || {})) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    // Check if the value is an object (but not null or an array) to continue flattening
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
    const spreadsheetId = "1RxdyCRhwYKGp8-fuYlHLhxvrdQTGcGg0bW93KzAuCtk";
    const sheetName = "Sheet1";
    const range = `${sheetName}!A:AG`; // 33 columns (A to AG)
    // Flatten submission data
    // THIS IS THE CRITICAL STEP: The frontend submission object is flattened here
    // to create keys like 'desire.genre_calling.value' that match the HEADERS.
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
