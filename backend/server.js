const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Code Explainer Server is running! Use /api/explain to explain code.' });
});

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

    const prompt = `
      Analyze the following code and provide a polished response with two parts:

      1. **Explanation**: Provide a concise, professional explanation of the code in plain English. Use Markdown formatting with:
         - A brief overview (1-2 sentences).
         - A numbered list of key components or steps, each with a clear heading and 1-2 sentences of description.
         - Avoid conversational phrases like "Okay, let's break down".
         - Keep the tone clear and technical, suitable for developers.

      2. **Mermaid Diagram**: Generate a valid Mermaid diagram (compatible with Mermaid 11.6.0) to visualize the code structure. Use:
         - A class diagram for object-oriented code (e.g., showing classes, methods, properties).
         - A flowchart for procedural code (e.g., showing function calls or logic flow).
         - Enclose the diagram in \`\`\`mermaid ... \`\`\`.
         - Ensure the syntax is correct and avoid errors like "Syntax error in text".

      Code to analyze:
      \`\`\`javascript
      ${code}
      \`\`\`
    `;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const result = await model.generateContent(prompt);
    if (!result || !result.response) {
      throw new Error('No response from Gemini API');
    }

    console.log('Received response from Gemini API');

    const text = await result.response.text();

    // Split response into explanation and diagram
    const parts = text.split('```mermaid');
    let explanation = parts[0].trim();
    let diagram = parts.length > 1 ? parts[1].split('```')[0].trim() : '';

    // Fallback if diagram is invalid or missing
    if (!diagram || diagram.includes('Syntax error')) {
      diagram = `graph TD
        A[Code Structure] --> B[Unable to generate diagram]
        B --> C[Check code complexity or try again]`;
    }

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