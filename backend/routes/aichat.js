const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.length < 2) {
    return res.status(400).json({ error: 'A valid message is required.' });
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
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
    res.json({ answer: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'AI service error', details: err.message });
  }
});

module.exports = router; 