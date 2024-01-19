const axios = require("axios");
const fs = require("fs");
const { ELEVENLABS_API_KEY } = require("./config");
const createAudio = require("./audioProcessor");

// Function to send a welcome message with language selection buttons
async function sendWelcomeMessage(chatId, bot) {
  const welcomeMessage = "Which language do you want to learn?";
  const languageKeyboard = {
    inline_keyboard: [
      [{ text: "English 🇺🇸", callback_data: "English" }],
      [{ text: "Español 🇪🇸", callback_data: "Spanish" }],
      [{ text: "Français 🇫🇷", callback_data: "French" }],
      [{ text: "Deutsch 🇩🇪", callback_data: "German" }],
      [{ text: "Русский 🇷🇺", callback_data: "Russian" }],
    ],
  };

  const options = {
    reply_markup: JSON.stringify(languageKeyboard),
  };

  await bot.sendMessage(chatId, welcomeMessage, options);
}

// Function to process language selection callbacks
async function processLanguageCallback(query, chatId, bot, selectedLanguages) {
  const language = query.data;
  selectedLanguages[chatId] = language;

  await bot.sendMessage(chatId, `Type a word (in English) you want to learn.`);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  await bot.sendMessage(
    chatId,
    `We will generate an audio story in ${language} using this word multiple times`
  );
}

// Function to process user messages and generate responses
async function processUserMessage(
  message,
  response,
  bot,
  openai,
  selectedLanguages
) {
  const { chat, text } = message;
  const chatId = chat.id;
  const language = selectedLanguages[chatId] || "english";

  let messageWriting = `✏️ Writing about: ${text}\nPlease wait 5-10 seconds`;
  await bot.sendMessage(chatId, messageWriting);

  const content = `Write in ${language} a story (around 3 lines) with A1 vocabulary from daily conversation. In the story should be at least 5 times the word: ${text}. the answer should be just the story`;

  const responseGpt = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: content }],
  });

  const generatedResponse = responseGpt.data.choices[0].message.content;
  await bot.sendMessage(chatId, generatedResponse);
  await bot.sendMessage(
    chatId,
    "🎧 Recording audio\nPlease wait 20-30 seconds"
  );

  createAudio(generatedResponse, chatId, bot);
}

module.exports = {
  sendWelcomeMessage,
  processUserMessage,
  processLanguageCallback,
};
