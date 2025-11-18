const { google } = require("googleapis");
const sheets = google.sheets("v4");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: "soulbox-418@acoustic-art-478618-k3.iam.gserviceaccount.com",
    private_key: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCsyUgVD9+FzyVMtRaynm4GTXPmoMeFFxVJwbMtanmyNWi6nyP6ZN95jGtzaLmm+kYlvM+RmMK8gA11S4R/0U6Mtsd3Wefm391mHojd9Qf7yBzFddRr5GfIPSQgn4bOFPXHwYAMd1Q3GhSw2v8EXyJhGjuYe8L5SreC+vDCzxHcXHhsiceFnmw7ygP0eHt+Shtm5Ol7gW1vXZlkXPLobUPZkjDLE0eCE2SQyEQewVZRK8VUED8kZ/Yga+FsVTFKCgfuXtZXi6228zOS5yMSPacVG21eb0+XypwpqfetiXNlDytu9Sdgu7CSJOiRDA67afzotjmUHfZp9+Kzwv8EZta7AgMBAAECggEAOPaq4va2tECUhXN2JjEBCObj/PaokIIJrKVFUwW1VUEyY8Qvck9rNYFLs2KlQh1knvBeZhu8p7R3u2HILvNsOAvSOtDTGVRYg2AxsysjFKjmg1rTSzaj2Gn/zRmKscpLNS3f7zwv8XKRu7SXOnO6u9SQLTcwEkvFsFLWqQLnWoQ+YUNZ7Sv5xTnM0Y6a/x9B3P64IUIZCeJLPHXErkzKCx2yMluWXAgXm1Yqgt0pCWWMY7QUq5C6tiO49oCEZ6ToyKX/IjUxTVicZ/8IxvxXQKGmPKq3nHud6bPfXintLszENgHDOvEJb49H/wMxkMSZqw/nERbM0lK5s/L4Ev2T4QKBgQDp7vysXfr2HPq2VDIYujJkkk8bfkBK4c9wpsjYXZDogHEEC5R2iQidJqRHaEr/s5OWyssy9GlwKI1vZKg7R4oadAwSBmxclTWTGENdk7cEsvbUCos9x6Xqxq7WGpZhLuIdR+6lqFi2IQKE9vy1eaWl0D05olD/gxaCW+yq192WQwKBgQC9FbauMHR7iGKy5Diuq8zR0YV2yL0phSaW5kc9itHUzAo+fxzkLAhv7n3fRMqC/mPokUYV+oRWcfmc60rqTS1u0muCXYkncTK9sL80HLbzLdUt+dqupmv+LGKmtDqGlF9mUf0VlPrfU0qJiZOMTQt5S2chcMV6K62xTuU76JnCKQKBgQDiPNumg1lTLeGV9cVhPqm/s/PHngjloo7w3ov9HDgpcxZZmC1jmdF30kgsOwPVWUGSItvzkoZqDv4BzfIZKm24eaS2xfmEbFUcxelYlaP5am7l0LCq9etTLAUoURxALoxFTyzQjwgEU9ZQ62CozVXTD5o2o/D7uzZIqkgvTYciawKBgHfUU/JuONO06j/OzHE95U6vRrKxote2T29gPpOs7y+5o2BZ9DhSA4LUFKczFFgR2cUgk9cH7WhPUM52ewKjqIBMD+ANYQdDANIgOfxPmk3gpPI/HqyCQXxSKq7VFyYEz7SrjwVnZdm0Ek+5hW1rwjK7a39Q1YWIOspcYoAl95OJAoGBAN59Rl0PhxCrmRhRoHctkJca6V7OlbJCC6+rzSIri7FJnyDJHmFMunUg/exW47rkpTtwE35IstHCwdgWK8JEBRxlb0RlgKdV1Dk82ToTk9HMP8LTrmyuGbDMJ4HkYEFcThvEFfqaE/mX5lYX/L6o/A6fgnm/Dh6yxPtE8GQzght0
-----END PRIVATE KEY-----
`
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
// Rest of your code — 100% unchanged
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
    if (!submission || !submission.email || !submission.country) {
      console.error("[SubmissionService] Invalid submission: missing required fields", { submission });
      return;
    }

    const sheetsClient = await auth.getClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID; // still using env for sheet ID
    const sheetName = process.env.SHEET_NAME || "Responses";
    const range = `${sheetName}!A:AG`;

    const flattened = flattenObject(submission);
    flattened.submitted_at = new Date().toISOString();
    flattened.region = flattened.region || flattened.country;

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

    const row = HEADERS.map((header) => flattened[header] || "");

    console.log("[SubmissionService] Appending submission row", {
      email: "[REDACTED]",
      submitted_at: flattened.submitted_at,
      arc_label: flattened["arc.label"],
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
    if (error.response?.data) console.error("Full error:", error.response.data);
  }
}

module.exports = { saveSubmission };
