// server/index.js - MODIFIED FOR GOOGLE GEMINI

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // New Google library

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5003;
// IMPORTANT: Make sure your .env file has GEMINI_API_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google AI Client
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in the .env file");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

app.post('/api/chat', async (req, res) => {
    const { history, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Gemini has a slightly different format for chat history.
        // It needs a `parts` array. We will transform our history to match it.
        const formattedHistory = history.map(msg => ({
            role: msg.role, // "user" or "assistant"
            parts: [{ text: msg.content }]
        }));

        // The system prompt defines the chatbot's role.
        const systemPrompt = "You are a friendly and helpful assistant for a volunteering application. Your goal is to answer user questions about volunteering opportunities, how to sign up, event details, and encourage participation. Be concise and encouraging.";

        // Start a chat session with the system prompt and conversation history
        const chat = model.startChat({
            generationConfig: {
                maxOutputTokens: 1024,
                temperature: 0.7,
            },
            // The system instruction is passed differently in the Gemini API
            systemInstruction: {
                role: "system", 
                parts: [{ text: systemPrompt }]
            },
            history: formattedHistory
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const reply = response.text();

        res.json({ reply });

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gemini server is running on port ${PORT} and is accessible from the outside.`);
});
