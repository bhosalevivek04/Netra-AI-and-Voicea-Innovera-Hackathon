const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Replace with your API keys
const SPEECH_TO_TEXT_API_KEY = 'your-google-speech-to-text-api-key';
const TEXT_TO_SPEECH_API_KEY = 'your-google-text-to-speech-api-key';
const CHATBOT_API_KEY = 'your-openai-api-key';

// Convert audio to text using Google Speech-to-Text
async function speechToText(audioFilePath) {
    const url = `https://speech.googleapis.com/v1/speech:recognize?key=${SPEECH_TO_TEXT_API_KEY}`;
    const audio = {
        content: fs.readFileSync(audioFilePath).toString('base64'),
    };
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
    };
    const response = await axios.post(url, { audio, config });
    return response.data.results[0].alternatives[0].transcript;
}

// Convert text to audio using Google Text-to-Speech
async function textToSpeech(text, outputFilePath) {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TEXT_TO_SPEECH_API_KEY}`;
    const data = {
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Wavenet-D' },
        audioConfig: { audioEncoding: 'MP3' },
    };
    const response = await axios.post(url, data);
    fs.writeFileSync(outputFilePath, Buffer.from(response.data.audioContent, 'base64'));
}

// Chatbot logic (using OpenAI GPT)
async function getChatbotResponse(userInput) {
    const url = 'https://api.openai.com/v1/completions';
    const response = await axios.post(url, {
        model: 'text-davinci-003',
        prompt: userInput,
        max_tokens: 150,
    }, {
        headers: { Authorization: `Bearer ${CHATBOT_API_KEY}` },
    });
    return response.data.choices[0].text.trim();
}

// API endpoint to handle audio input
app.post('/chat', upload.single('audio'), async (req, res) => {
    try {
        const audioFilePath = req.file.path;
        const userText = await speechToText(audioFilePath);
        const chatbotResponse = await getChatbotResponse(userText);
        const audioOutputPath = path.join(__dirname, 'response.mp3');
        await textToSpeech(chatbotResponse, audioOutputPath);
        res.sendFile(audioOutputPath);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing your request');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));