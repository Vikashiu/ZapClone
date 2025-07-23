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
exports.notionOauth = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");
const app = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
require("dotenv").config();
app.get('/', (req, res) => {
    const redirect_uri = process.env.NOTION_REDIRECT_URI;
    const client_id = process.env.NOTION_CLIENT_ID;
    const state = uuidv4();
    const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&state=${state}`;
    res.redirect(url);
});
app.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.query;
    const response = yield fetch("https://api.notion.com/v1/oauth/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " + Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            grant_type: "authorization_code",
            code,
            redirect_uri: process.env.NOTION_REDIRECT_URI
        })
    });
    const data = yield response.json(); // Contains access_token, workspace_id, bot_id, etc.
    const { access_token, workspace_id, workspace_name, bot_id, duplicated_template_id, // optional
    owner } = data;
    const currentUserId = "1"; // replace this!
    yield prisma.notionCredential.upsert({
        where: { userId: currentUserId },
        update: {
            accessToken: access_token,
            botId: bot_id,
            workspaceId: workspace_id,
            workspaceName: workspace_name,
        },
        create: {
            userId: currentUserId,
            accessToken: access_token,
            botId: bot_id,
            workspaceId: workspace_id,
            workspaceName: workspace_name,
        },
    });
    // Save the token to DB per user
    console.log("✅ Notion token received:", data);
    // Redirect user to dashboard
    res.redirect('/dashboard');
}));
exports.notionOauth = app;
