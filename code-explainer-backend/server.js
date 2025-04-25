const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Routes
app.post('/api/explain', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      console.log('No code provided');
      return res.status(400).json({ error: 'Code is required' });
    }

    console.log('Processing code:', code);
    console.log('API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

    const prompt = `Explain the following code in plain English and generate a Mermaid diagram showing the code structure:\n\n${code}`;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const result = await model.generateContent(prompt);
    if (!result) {
      throw new Error('No response from Gemini API');
    }

    const response = await result.response;
    const text = response.text();

    console.log('Received response from Gemini API');

    // Split the response into explanation and diagram
    const parts = text.split('```mermaid');
    const explanation = parts[0].trim();
    const diagram = parts.length > 1 ? parts[1].split('```')[0].trim() : '';

    console.log('Processed response:', { 
      hasExplanation: !!explanation, 
      hasDiagram: !!diagram 
    });

    res.json({ explanation, diagram });
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to explain code',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const status = {
    status: 'ok',
    apiKey: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  };
  console.log('Health check:', status);
  res.json(status);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Key status: ${process.env.GEMINI_API_KEY ? 'configured' : 'missing'}`);
}); 