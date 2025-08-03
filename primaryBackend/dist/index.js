"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const zapRoutes_1 = __importDefault(require("./routes/zapRoutes"));
const triggerRoutes_1 = require("./routes/triggerRoutes");
const actionRoutes_1 = require("./routes/actionRoutes");
const oauth2callbackRouter_1 = require("./routes/oauth2callbackRouter");
const notionOauth_1 = require("./routes/notionOauth");
const googleApiRoutes_1 = require("./routes/googleApiRoutes");
const authMiddleware_1 = require("./authMiddleware");
const { google } = require("googleapis");
require("dotenv").config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/oauth2callback", oauth2callbackRouter_1.oauth2callbackRouter);
app.use("/api/v1/user", userRoutes_1.default);
app.use("/api/v1/zap", zapRoutes_1.default);
app.use("/api/v1/trigger", triggerRoutes_1.triggerRouter);
app.use("/api/v1/action", actionRoutes_1.actionRouter);
app.use("/api/oauth/notion", notionOauth_1.notionOauth);
app.use("/api/v1/google", googleApiRoutes_1.googleApiRoute);
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
app.get("/auth", authMiddleware_1.authMiddleware, (req, res) => {
    // @ts-ignore
    const userId = req.id;
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: 'consent',
        scope: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/spreadsheets",
            'https://www.googleapis.com/auth/drive.readonly'
        ],
        state: JSON.stringify({ userId }),
    });
    res.json({ url });
});
// app.get("/oauth2callback", async (req, res) => {
//   const { code } = req.query;
//   console.log(code);
//   const { tokens } = await oauth2Client.getToken(code);
//   oauth2Client.setCredentials(tokens);
//   // Save these tokens somewhere securely
//   console.log("Tokens:", tokens);
//   res.send("OAuth complete. Check server console.");
// });
// app.post("/webhook", express.json(), (req, res) => {
//   console.log("📨 Google sent a notification!");
//   console.log("Headers:", req.headers);
//   res.sendStatus(200);
// });
app.listen(3000, () => {
    console.log("listening at 3000");
});
