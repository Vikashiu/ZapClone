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
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../authMiddleware");
const app = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
app.get("/", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    // @ts-ignore
    const userId = req.id;
    // console.log(code);
    try {
        const { tokens } = yield oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        console.log("hi");
        console.log(tokens);
        yield prisma.googleCredentials.upsert({
            where: { userId: userId },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
            create: {
                userId: userId,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            },
        });
        console.log("✅ Credentials saved for user:", userId);
        res.send("OAuth complete. Webhook registered. Check console.");
    }
    catch (error) {
        console.log("❌ Error in OAuth callback:", error);
        res.status(500).send("Authentication failed.");
    }
}));
exports.oauth2callbackRouter = app;
