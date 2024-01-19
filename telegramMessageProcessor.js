const { sendWelcomeMessage, processUserMessage, processLanguageCallback } = require('./messageHandlers');

// Global storage for selected languages by chat ID
const selectedLanguages = {};

// Function to process incoming Telegram messages
async function processTelegramMessage(body, response, bot, openai) {
  // Extracting message and callback query from the request body
  const { message, callback_query } = body;

  // Handling the '/start' command
  if (message && message.text == "/start") {
    // Send welcome message with language selection options
    await sendWelcomeMessage(message.chat.id, bot);
  } else if (message) {
    // Process standard user messages
    await processUserMessage(message, response, bot, openai, selectedLanguages);
  } else if (callback_query) {
    // Handle callback queries (e.g., from inline keyboards)
    await processLanguageCallback(callback_query, callback_query.message.chat.id, bot, selectedLanguages);
  }
}

module.exports = processTelegramMessage;
