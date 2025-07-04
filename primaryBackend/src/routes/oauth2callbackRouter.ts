import { Router } from "express";

const app = Router();
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get("/", async (req, res) => {
  const { code } = req.query;
  const userId ="";
  const zapId = "";

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // 🔔 Register webhook (events.watch)
    const response = await calendar.events.watch({
      calendarId: "primary",
      requestBody: {
        id: uuidv4(), // unique ID for this channel
        type: "web_hook",
        address: `https://c2c9-2409-40c4-10f9-e493-2964-a5e7-65a-fa39.ngrok-free.app/catch/${userId}/${zapId}`, // replace with your current ngrok URL
      },
    });

    
    

    res.send("OAuth complete. Webhook and Sheets action registered.");

    res.send("OAuth complete. Webhook registered. Check console.");
    } catch (error) {
      console.error("❌ Error in OAuth callback:", error);
      res.status(500).send("Authentication failed.");
    }
});

export const oauth2callbackRouter = app;