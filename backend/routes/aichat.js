const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config(); // Load environment variables

router.post('/', async (req, res) => {
  const { message } = req.body;

  // Input validation
  if (!message || typeof message !== 'string' || message.trim().length < 2) {
    return res.status(400).json({ error: 'A valid message (minimum 2 characters) is required.' });
  }

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: Missing API key' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message.trim() }],
        max_tokens: 256,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    // Validate response
    if (!response.data.choices?.[0]?.message?.content) {
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    res.json({ answer: response.data.choices[0].message.content });
  } catch (err) {
    // Enhanced error handling
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out' });
    }
    if (err.response) {
      return res.status(err.response.status).json({
        error: 'OpenAI API error',
        details: err.response.data.error?.message || err.message,
      });
    }
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

module.exports = router;