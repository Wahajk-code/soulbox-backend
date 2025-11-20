import { google } from "googleapis";

export async function GET() {
  const logs = [];

  function log(msg) {
    logs.push(msg);
  }

  log("🔍 Starting Vercel Google Sheets Debug...");

  // 1) Check env variables
  log("🧪 ENV CHECK:");
  log("GOOGLE_CLIENT_EMAIL: " + (process.env.GOOGLE_CLIENT_EMAIL || "❌ MISSING"));
  log("GOOGLE_SHEET_ID: " + (process.env.GOOGLE_SHEET_ID || "❌ MISSING"));
  log("SHEET_NAME: " + (process.env.SHEET_NAME || "defaulting to 'Responses'"));
  log("PRIVATE_KEY exists: " + (!!process.env.GOOGLE_PRIVATE_KEY));

  // 2) Format private key
  let key = process.env.GOOGLE_PRIVATE_KEY;
  if (!key) {
    return Response.json({ error: "PRIVATE KEY missing", logs }, { status: 500 });
  }

  key = key.replace(/\\n/g, "\n");

  // 3) Try auth
  log("🧪 AUTHENTICATING...");
  let sheetsClient;
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: key,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    sheetsClient = await auth.getClient();
    log("✔ Auth successful");
  } catch (err) {
    log("❌ AUTH FAILED: " + err.message);
    return Response.json({ logs }, { status: 500 });
  }

  const sheets = google.sheets("v4");
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const sheetName = process.env.SHEET_NAME || "Responses";

  // 4) Test spreadsheet access
  log("🧪 Testing spreadsheet access...");
  try {
    const meta = await sheets.spreadsheets.get({
      auth: sheetsClient,
      spreadsheetId,
    });

    log("✔ Spreadsheet accessible: " + meta.data.properties.title);
  } catch (err) {
    log("❌ Spreadsheet ACCESS FAILED: " + err.message);
    log("➡ This means your SERVICE ACCOUNT EMAIL is not shared on the sheet.");
    return Response.json({ logs }, { status: 500 });
  }

  // 5) Test sheet tab existence
  log("🧪 Testing sheet tab...");
  try {
    await sheets.spreadsheets.values.get({
      auth: sheetsClient,
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });
    log("✔ Sheet tab found: " + sheetName);
  } catch (err) {
    log("❌ TAB FAILED: " + err.message);
    log("➡ Wrong sheet tab name OR no permissions");
    return Response.json({ logs }, { status: 500 });
  }

  log("🎉 ALL CHECKS PASSED.");
  return Response.json({ logs });
}
