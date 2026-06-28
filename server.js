const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set' });
  }

  try {
    const groqBody = {
      model: 'llama-3.3-70b-versatile',
      max_tokens: req.body.max_tokens || 1200,
      messages: req.body.messages
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify(groqBody)
    });

    const data = await response.json();

    if (data.error) {
      return res.json({ error: data.error });
    }

    // Convert Groq format -> Anthropic format so the frontend stays 100% identical
    const text = data.choices?.[0]?.message?.content || '';
    res.json({ content: [{ type: 'text', text }] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
