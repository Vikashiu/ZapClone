import { google } from "googleapis";
import dotenv from "dotenv"

dotenv.config();
// import { sendEmail } from "../utils/email"; // from resend
// import { PrismaClient } from "@prisma/client";

// const client = new PrismaClient();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  access_token: process.env.GOOGLE_ACCESS_TOKEN,
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export async function appendRow() {
    console.log("at append row")
  const sheets = google.sheets({ version: "v4", auth: oauth2Client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [["Zap Triggered", new Date().toISOString()]],
    },
  });

  

  console.log("✅ Zap processed:");
}
