const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const Chat = require('./models/Chat');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup upload directory
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (can be disabled via environment variable)
const DISABLE_MONGODB = process.env.DISABLE_MONGODB === 'true';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-assistant';

if (!DISABLE_MONGODB) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => console.warn('MongoDB connection error - running without database:', err.message));
} else {
  console.log('MongoDB is disabled via DISABLE_MONGODB=true');
}

// Mount Routes
app.use('/api/auth', authRoutes);

// Initialize Gemini conditionally to prevent crashing if key is missing
let ai;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.trim() !== '') {
  ai = new GoogleGenAI(apiKey);
}

// Chat API Route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, history, fileContext } = req.body;

    if (!message && !fileContext) {
      return res.status(400).json({ error: 'Message or file is required' });
    }

    let replyText = "";

    if (!ai) {
      // Mock mode
      console.log("No Gemini API key found, returning mock response.");
      const mockReplies = [
        "That's an interesting perspective! Tell me more.",
        "I'm currently running in mock mode because no Gemini API key was provided, but I hear you loud and clear!",
        "Fascinating! How does that relate to your main project?",
        "I can help with that once my API key is configured. For now, I'm just a placeholder AI.",
        "Beep boop! Mock response activated."
      ];
      replyText = mockReplies[Math.floor(Math.random() * mockReplies.length)];
      
      // Save chat history
      if (!DISABLE_MONGODB && mongoose.connection.readyState === 1) {
        const chat = new Chat({ userId, message, reply: replyText });
        await chat.save().catch(err => console.warn("Could not save chat:", err.message));
      }
      // Simulate network delay and streaming
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      const words = replyText.split(' ');
      let i = 0;
      const interval = setInterval(() => {
        if (i < words.length) {
          res.write(`data: ${JSON.stringify({ text: words[i] + ' ' })}\n\n`);
          i++;
        } else {
          clearInterval(interval);
          res.end();
        }
      }, 100);
      return;
    }

    // Call Gemini API with Context Memory and Streaming
    const chatSession = ai.chats.create({
      model: 'gemini-1.5-flash',
      history: history || [],
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Construct the current message payload
    let payload;
    if (fileContext) {
      const parts = [];
      parts.push({ text: `[Attached File: ${fileContext.filename}]\n${fileContext.text}\n\n` });
      if (fileContext.base64) {
        parts.push({
          inlineData: {
            data: fileContext.base64,
            mimeType: fileContext.mimeType
          }
        });
      }
      if (message) {
        parts.push({ text: message });
      }
      payload = parts;
    } else {
      payload = message || "";
    }

    const responseStream = await chatSession.sendMessageStream({ message: payload });

    let fullReply = "";
    for await (const chunk of responseStream) {
      fullReply += chunk.text;
      res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
    }
    res.end();

    // Save chat history only if DB is connected to prevent hangs
    if (!DISABLE_MONGODB && mongoose.connection.readyState === 1) {
      const chat = new Chat({ userId, message, reply: fullReply });
      await chat.save().catch(err => console.warn("Could not save chat:", err.message));
    }

  } catch (error) {
    console.error("Error calling Gemini:", error);
    
    // Fall back to mock mode if API call fails
    const mockReplies = [
      "That's an interesting perspective! Tell me more.",
      "I'm currently running in mock mode because the API key is invalid, but I hear you loud and clear!",
      "Fascinating! How does that relate to your main project?",
      "I can help with that once the API key is configured. For now, I'm just a placeholder AI.",
      "Beep boop! Mock response activated."
    ];
    const replyText = mockReplies[Math.floor(Math.random() * mockReplies.length)];
    
    // Stream the mock response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const words = replyText.split(' ');
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        res.write(`data: ${JSON.stringify({ text: words[i] + ' ' })}\n\n`);
        i++;
      } else {
        clearInterval(interval);
        res.end();
      }
    }, 100);
  }
});

// File Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let extractedText = '';
    let base64Data = null;
    
    // If it's a PDF, extract text
    if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (req.file.mimetype.startsWith('image/')) {
      // For images, we read the file into base64 to send to Gemini Vision
      const dataBuffer = fs.readFileSync(req.file.path);
      base64Data = dataBuffer.toString('base64');
      extractedText = "[Image uploaded for visual analysis]";
    } else {
      extractedText = fs.readFileSync(req.file.path, 'utf8');
    }

    res.json({ 
      message: 'File processed successfully',
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      base64: base64Data,
      extractedText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : '') 
    });

  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: 'Failed to process file' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
