const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const dotenv = require('dotenv').config();
const express = require('express');
const multer = require('multer');
const app = express();

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

app.post('/generate', upload.single('image'), async (req, res) => {
  try {
    // For text-and-image input (multimodal), use the gemini-pro-vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = "What recipes can be made from the given images?";

    const imageBuffer = req.file.buffer;
    const imagePart = fileToGenerativePart(imageBuffer, "image/jpeg");

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ generatedText: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error generating content' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});