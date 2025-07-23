import { Client } from "@notionhq/client";

const notion = new Client({
  auth: "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", // Your internal integration token
});

export async function appendNotionRow() {
//   const databaseId = process.env.NOTION_DB_ID; // Store in .env

  const response = await notion.pages.create({
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
}
