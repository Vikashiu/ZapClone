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
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
app.get("/auth", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/calendar"],
    });
    res.redirect(url);
});
app.get("/oauth2callback", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const { tokens } = yield oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    // Save these tokens somewhere securely
    console.log("Tokens:", tokens);
    res.send("OAuth complete. Check server console.");
}));
app.post("/webhook", express_1.default.json(), (req, res) => {
    console.log("📨 Google sent a notification!");
    console.log("Headers:", req.headers);
    res.sendStatus(200);
});
app.listen(3000, () => {
    console.log("listening at 3000");
});
