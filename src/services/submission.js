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

const HEADERS = [

  "submitted_at",

  "name",

  "email",

  "country",

  "region",

  "arc.system",

  "arc.label",

  "arc.rule_fired",

  "desire.genre_fluidity",

  "desire.plot_engine",

  "desire.genre_calling",

  "desire.genre_flavour",

  "desire.genre_subflavour",

  "desire.genre_visual",

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

  "reader_context.reading_habits",

  "reader_context.heavy_triggers",

  "reader_context.age_stage",

];

const FALLBACK_PATHS = {

  "desire.genre_fluidity": ["desire.genre_fluidity.value"],

  "desire.plot_engine": ["desire.plot_engine.value"],

  "desire.genre_calling": ["desire.genre_calling.value"],

  "desire.genre_flavour": ["desire.genre_flavour.value"],

  "desire.genre_subflavour": ["desire.genre_subflavour.value"],

  "desire.genre_visual": ["desire.genre_visual.value"],

  "desire.tone": ["desire.tone.value"],

  "desire.pacing": ["desire.pacing.value"],

  "desire.literary_depth": ["desire.literary_depth.value"],

  "desire.plot_bias": ["desire.plot_bias.value"],

  "desire.sensitivity": ["desire.sensitivity.value"],

  "soul_climate.temperature_primary.tag": [

    "soul_climate.temperature_primary.tag.value",

  ],

  "soul_climate.temperature_primary.whisper_text": [

    "soul_climate.temperature_primary.whisper_text.value",

    "soul_climate.temperature_primary.tag.label",

  ],

  "soul_climate.temperature_secondary.tag": [

    "soul_climate.temperature_secondary.whisper_text.value",

  ],

  "soul_climate.temperature_secondary.image_id": [

    "soul_climate.temperature_secondary.whisper_text.imageId",

  ],

  "soul_climate.posture.final": ["soul_climate.posture.final.value"],

  "soul_climate.posture.path.q9a": ["soul_climate.posture.path.q9a.value"],

  "soul_climate.posture.path.q9b": ["soul_climate.posture.path.q9b.value"],

  "yearning.cluster_image": ["yearning.cluster_image.value"],

  "yearning.final": ["yearning.final.value"],

  "yearning.whisper_confirm": ["yearning.whisper_confirm.value"],

  "reader_context.favourite_books": [

    "reader_context.favourite_books",

    "reader_context.favourite_books.value",

    "reader_context.favourite_book",

    "reader_context.favourite_book.value",

  ],

  "reader_context.themes_issues": [

    "reader_context.themes_issues",

    "reader_context.themes_issues.value",

    "reader_context.issues_struggles",

    "reader_context.issues_struggles.value",

  ],

  "reader_context.reading_habits": [

    "reader_context.reading_habits",

    "reader_context.reading_habits.value",

  ],

  "reader_context.heavy_triggers": [

    "reader_context.heavy_triggers",

    "reader_context.heavy_triggers.value",

  ],

  "reader_context.age_stage": [

    "reader_context.age_stage",

    "reader_context.age_stage.value",

  ],

};

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

function previewValue(value) {

  if (value === undefined) return "[undefined]";

  if (value === null) return "[null]";

  if (value === "") return "[empty string]";

  if (typeof value === "string") return value;

  return JSON.stringify(value);

}

async function saveSubmission(submission) {

  try {

    if (!submission || !submission.email || !submission.country) {

      console.error("[SubmissionService] Invalid submission: missing required fields", {

        hasSubmission: !!submission,

        hasEmail: !!submission?.email,

        hasCountry: !!submission?.country,

      });

      return;

    }

    const sheetsClient = await auth.getClient();

    const spreadsheetId = "1RxdyCRhwYKGp8-fuYlHLhxvrdQTGcGg0bW93KzAuCtk";

    const sheetName = "Sheet1";

    const range = `${sheetName}!A:AL`;

    const headerRange = `${sheetName}!A1:AL1`;

    console.log("[SubmissionService] Incoming submission snapshot", {

      email: submission.email,

      country: submission.country,

      desireKeys: Object.keys(submission.desire || {}),

      readerContextKeys: Object.keys(submission.reader_context || {}),

    });

    const flattened = flattenObject(submission);

    flattened.submitted_at = new Date().toISOString();

    flattened.region = flattened.region || flattened.country;

    console.log("[SubmissionService] Flattened payload keys", Object.keys(flattened));

    console.log("[SubmissionService] New field raw check", {

      "desire.genre_fluidity": previewValue(flattened["desire.genre_fluidity"]),

      "desire.genre_fluidity.value": previewValue(flattened["desire.genre_fluidity.value"]),

      "desire.plot_engine": previewValue(flattened["desire.plot_engine"]),

      "desire.plot_engine.value": previewValue(flattened["desire.plot_engine.value"]),

      "reader_context.themes_issues": previewValue(flattened["reader_context.themes_issues"]),

      "reader_context.issues_struggles": previewValue(flattened["reader_context.issues_struggles"]),

      "reader_context.age_stage": previewValue(flattened["reader_context.age_stage"]),

      "reader_context.age_stage.value": previewValue(flattened["reader_context.age_stage.value"]),

    });

    const existing = await sheets.spreadsheets.values

      .get({

        auth: sheetsClient,

        spreadsheetId,

        range: headerRange,

      })

      .catch(() => null);

    const existingHeaders = existing?.data?.values?.[0] || [];

    const headersMissing = existingHeaders.length === 0;

    const headersMismatch = existingHeaders.length !== HEADERS.length;

    console.log("[SubmissionService] Header check", {

      expectedHeaderCount: HEADERS.length,

      existingHeaderCount: existingHeaders.length,

      headersMissing,

      headersMismatch,

      existingHeaders,

    });

    if (headersMissing || headersMismatch) {

      console.log("[SubmissionService] Writing headers to sheet");

      await sheets.spreadsheets.values.update({

        auth: sheetsClient,

        spreadsheetId,

        range: headerRange,

        valueInputOption: "RAW",

        resource: { values: [HEADERS] },

      });

    }

    const getValue = (header) => {

      if (flattened[header] !== undefined && flattened[header] !== null && flattened[header] !== "") {

        return flattened[header];

      }

      const fallbacks = FALLBACK_PATHS[header] || [];

      for (const fb of fallbacks) {

        if (flattened[fb] !== undefined && flattened[fb] !== null && flattened[fb] !== "") {

          return flattened[fb];

        }

      }

      return "";

    };

    const mappingDebug = HEADERS.map((header) => {

      const direct = flattened[header];

      const fallbacks = FALLBACK_PATHS[header] || [];

      let resolvedFrom = "none";

      let resolvedValue = "";

      if (direct !== undefined && direct !== null && direct !== "") {

        resolvedFrom = header;

        resolvedValue = direct;

      } else {

        for (const fb of fallbacks) {

          if (flattened[fb] !== undefined && flattened[fb] !== null && flattened[fb] !== "") {

            resolvedFrom = fb;

            resolvedValue = flattened[fb];

            break;

          }

        }

      }

      return {

        header,

        resolvedFrom,

        resolvedValue: previewValue(resolvedValue),

      };

    });

    console.log("[SubmissionService] Header mapping debug", mappingDebug);

    const row = HEADERS.map((header) => getValue(header));

    console.log("[SubmissionService] Final row preview", {

      rowLength: row.length,

      email: "[REDACTED]",

      submitted_at: flattened.submitted_at,

      "desire.genre_fluidity": previewValue(row[HEADERS.indexOf("desire.genre_fluidity")]),

      "desire.plot_engine": previewValue(row[HEADERS.indexOf("desire.plot_engine")]),

      "reader_context.themes_issues": previewValue(row[HEADERS.indexOf("reader_context.themes_issues")]),

      "reader_context.age_stage": previewValue(row[HEADERS.indexOf("reader_context.age_stage")]),

    });

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

    if (error.response?.data) {

      console.error("[SubmissionService] Google API error data:", error.response.data);

    }

  }

}

module.exports = { saveSubmission };
