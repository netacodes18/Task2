const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log("Calling Gemini 3.5 flash...");
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: "Say hello world"
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
