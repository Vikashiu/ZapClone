import express from "express";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import zapRouter from "./routes/zapRoutes";
import { triggerRouter } from "./routes/triggerRoutes";
import { actionRouter } from "./routes/actionRoutes";
import { oauth2callbackRouter } from "./routes/oauth2callbackRouter";
const { google } = require("googleapis");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/oauth2callback", oauth2callbackRouter)

app.use("/api/v1/user", userRouter);
app.use("/api/v1/zap", zapRouter);

app.use("/api/v1/trigger", triggerRouter);
app.use("/api/v1/action", actionRouter)

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

app.get("/auth", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/spreadsheets"

    ],
  });
  res.redirect(url);
});

app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save these tokens somewhere securely
  console.log("Tokens:", tokens);

  res.send("OAuth complete. Check server console.");
});

app.post("/webhook", express.json(), (req, res) => {
  console.log("📨 Google sent a notification!");
  console.log("Headers:", req.headers);
  res.sendStatus(200);
});



app.listen(3000, () => {
    console.log("listening at 3000");
})