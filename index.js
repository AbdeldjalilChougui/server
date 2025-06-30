// server/index.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5003;

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/chat/completions';

app.post('/api/chat', async (req, res) => {
    // 'history' is the key to remembering the conversation
    const { history, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // The system prompt defines the chatbot's role and personality.
    const systemPrompt = {
        role: "system",
        content: "You are a friendly and helpful assistant for a volunteering application. Your goal is to answer user questions about volunteering opportunities, how to sign up, event details, and encourage participation. Be concise and encouraging."
    };

    // Combine the system prompt, the past conversation history, and the new user message
    const messages = [
        systemPrompt,
        ...history, // The magic of conversation history!
        { role: "user", content: message }
    ];

    try {
        const response = await axios.post(
            API_URL,
            {
                model: 'deepseek-chat', // or 'deepseek-coder'
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                },
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get a response from the AI.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});