const axios = require("axios");
const fs = require("fs");
const { ELEVENLABS_API_KEY } = require("./config");

// Function to create audio from text using ElevenLabs API
async function createAudio(generatedResponse, chatId, bot) {
  // Specific voice ID for the speech synthesis
  const voice_id = "XB0fDUnXU5powFXDhCwa"; // Charlotte

  // ElevenLabs API endpoint configuration
  const url = "https://api.elevenlabs.io/v1/text-to-speech/" + voice_id;
  const headers = {
    Accept: "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": ELEVENLABS_API_KEY,
  };

  // Data payload for the API request
  const dataElevenLabs = {
    text: generatedResponse,
    model_id: "eleven_multilingual_v2",
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true,
    },
  };

  // Axios request configuration
  const config = {
    method: "post",
    url: url,
    headers: headers,
    responseType: "stream",
    data: dataElevenLabs,
  };

  try {
    // Making the request to ElevenLabs API
    const audioResponse = await axios(config);

    // Validating the response
    if (!audioResponse || !audioResponse.data) {
      console.error("Invalid response from API");
      return;
    }

    // Writing the received audio data to a file
    const fileName = `${Date.now()}.mp3`;
    const filePath = `/tmp/${fileName}`;
    const writer = fs.createWriteStream(filePath);
    audioResponse.data.pipe(writer);

    // Waiting for file write to complete
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // Sending the audio file via Telegram bot
    await bot.sendAudio(chatId, filePath);

    // Logging the file creation
    console.log(`File written to ${filePath}`);
  } catch (error) {
    // Error handling for API request
    console.error("Error making API request:", error);
  }
}

module.exports = createAudio;
