const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const TelegramBot = require("node-telegram-bot-api");
const processTelegramMessage = require("./telegramMessageProcessor");
const { PORT, TELEGRAM_TOKEN, OPENAI_API_KEY } = require("./config");

// Initializing
const app = express();
const configuration = new Configuration({ apiKey: OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(TELEGRAM_TOKEN);

app.use(express.static("public"));
app.use(express.json());

// GET endpoint to verify server status
app.get("/", (req, res) => res.send("OK"));

// POST endpoint to handle Telegram bot interactions
app.post("/", async (req, res, next) => {
  try {
    await processTelegramMessage(req.body, res, bot, openai);
    res.send("OK");
  } catch (error) {
    next(error);
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

// Starting server
const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
server.setTimeout(30000);
