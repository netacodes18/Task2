const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    const response = await ai.models.list();
    // In @google/genai, models.list() might not exist or return differently
    // Actually, let's just use native fetch to get the models directly from the REST API to be safe
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error(e);
  }
}
run();
