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
exports.appendNotionRow = appendNotionRow;
const client_1 = require("@notionhq/client");
const notion = new client_1.Client({
    auth: "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", // Your internal integration token
});
function appendNotionRow() {
    return __awaiter(this, void 0, void 0, function* () {
        //   const databaseId = process.env.NOTION_DB_ID; // Store in .env
        const response = yield notion.pages.create({
            parent: { database_id: "233a8d47bfcb80c4adee000cc7ee4e66" },
            properties: {
                Name: {
                    title: [
                        {
                            text: {
                                content: "Zap Triggered",
                            },
                        },
                    ],
                },
                Status: {
                    select: {
                        name: "Pending", // must match an existing select option
                    },
                },
                Date: {
                    date: {
                        start: new Date().toISOString(),
                    },
                },
            },
        });
        console.log("✅ Row added:", response.id);
    });
}
