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
exports.googleApiRoute = void 0;
exports.getWorksheets = getWorksheets;
exports.getSheetColumns = getSheetColumns;
const express_1 = require("express");
const authMiddleware_1 = require("../authMiddleware");
// Assuming the functions from the 'google-sheets-api-expansion' artifact are in this path
const googleapis_1 = require("googleapis");
const client_1 = require("@prisma/client");
const app = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
// This function is essentially the logic you had in your original /sheets route.
// It's better to keep it separate for clarity.
function getAuthenticatedClient(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const creds = yield prismaClient.googleCredentials.findFirst({ where: { userId } });
        if (!creds || !creds.accessToken || !creds.refreshToken) {
            throw new Error(`No valid Google credentials found for user ID: ${userId}.`);
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        oauth2Client.setCredentials({
            access_token: creds.accessToken,
            refresh_token: creds.refreshToken,
        });
        oauth2Client.on('tokens', (tokens) => __awaiter(this, void 0, void 0, function* () {
            if (tokens.access_token) {
                console.log('Access token was refreshed.');
                yield prismaClient.googleCredentials.update({
                    where: { userId: userId },
                    data: { accessToken: tokens.access_token },
                });
            }
        }));
        return oauth2Client;
    });
}
/**
 * Fetches the list of worksheets (tabs) for a given spreadsheet.
 * @param userId The ID of the user.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @returns A promise that resolves to an array of worksheet titles.
 */
function getWorksheets(userId, spreadsheetId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const auth = yield getAuthenticatedClient(userId);
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        try {
            const response = yield sheets.spreadsheets.get({
                spreadsheetId,
            });
            const worksheetTitles = (_a = response.data.sheets) === null || _a === void 0 ? void 0 : _a.map(sheet => { var _a; return ((_a = sheet.properties) === null || _a === void 0 ? void 0 : _a.title) || ''; }).filter(Boolean);
            return worksheetTitles || [];
        }
        catch (error) {
            console.error("Error fetching worksheets:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            throw new Error("Failed to fetch worksheets.");
        }
    });
}
/**
 * Fetches the header row (columns) from a specific worksheet.
 * @param userId The ID of the user.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param sheetName The name of the worksheet (tab).
 * @returns A promise that resolves to an array of column header strings.
 */
function getSheetColumns(userId, spreadsheetId, sheetName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const auth = yield getAuthenticatedClient(userId);
        const sheets = googleapis_1.google.sheets({ version: 'v4', auth });
        try {
            const response = yield sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!1:1`, // Fetches the entire first row
            });
            return ((_a = response.data.values) === null || _a === void 0 ? void 0 : _a[0]) || [];
        }
        catch (error) {
            console.error("Error fetching sheet columns:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            throw new Error("Failed to fetch sheet columns.");
        }
    });
}
function getGoogleSheets(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const creds = yield prismaClient.googleCredentials.findFirst({ where: { userId } });
        if (!creds || !creds.accessToken || !creds.refreshToken) {
            throw new Error(`No valid Google credentials found for user ID: ${userId}.`);
        }
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI);
        oauth2Client.setCredentials({
            access_token: creds.accessToken,
            refresh_token: creds.refreshToken,
        });
        oauth2Client.on('tokens', (tokens) => __awaiter(this, void 0, void 0, function* () {
            if (tokens.access_token) {
                console.log('Access token was refreshed for fetching sheets.');
                yield prismaClient.googleCredentials.update({
                    where: { userId: userId },
                    data: { accessToken: tokens.access_token },
                });
            }
        }));
        const drive = googleapis_1.google.drive({ version: 'v3', auth: oauth2Client });
        const response = yield drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name)',
            pageSize: 100,
        });
        const files = response.data.files;
        if (files && files.length) {
            return files.map(file => ({
                id: file.id || '',
                name: file.name || 'Untitled Spreadsheet'
            }));
        }
        else {
            return [];
        }
    });
}
// Route 1: Get all spreadsheets
app.get('/sheets', authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id.toString();
    try {
        const sheets = yield getGoogleSheets(userId);
        res.json({ sheets });
    }
    catch (error) {
        console.error("Error fetching Google Sheets:", error);
        res.status(500).json({ message: "Failed to fetch Google Sheets." });
    }
}));
// Route 2: Get all worksheets for a given spreadsheet
app.get("/sheets/:spreadsheetId/worksheets", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id.toString();
    const { spreadsheetId } = req.params;
    try {
        const worksheets = yield getWorksheets(userId, spreadsheetId);
        res.json({ worksheets });
    }
    catch (error) {
        console.error("Error fetching worksheets:", error);
        res.status(500).json({ message: "Failed to fetch worksheets." });
    }
}));
// Route 3: Get all columns for a given worksheet
app.get("/sheets/:spreadsheetId/worksheets/:sheetName/columns", authMiddleware_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.id.toString();
    const { spreadsheetId, sheetName } = req.params;
    try {
        const columns = yield getSheetColumns(userId, spreadsheetId, sheetName);
        res.json({ columns });
    }
    catch (error) {
        console.error("Error fetching columns:", error);
        res.status(500).json({ message: "Failed to fetch columns." });
    }
}));
exports.googleApiRoute = app;
