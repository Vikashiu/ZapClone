"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauth2callbackRouter = void 0;
const express_1 = require("express");
const app = (0, express_1.Router)();
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    try {
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        // 🔔 Register webhook (events.watch)
        const response = yield calendar.events.watch({
            calendarId: "primary",
            requestBody: {
                id: uuidv4(), // unique ID for this channel
                type: "web_hook",
                address: "https://c2c9-2409-40c4-10f9-e493-2964-a5e7-65a-fa39.ngrok-free.app/webhook", // replace with your current ngrok URL
            },
        });
        console.log("✅ Webhook channel registered:", response.data);
        res.send("OAuth complete. Webhook registered. Check console.");
    }
    catch (error) {
        console.error("❌ Error in OAuth callback:", error);
        res.status(500).send("Authentication failed.");
    }
}));
exports.oauth2callbackRouter = app;
