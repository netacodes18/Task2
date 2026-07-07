import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateMongoPipeline = async (
  question: string,
  collectionName: string,
  schema: any[],
  sampleRows: any[] = []
): Promise<string> => {
  const schemaDescription = schema
    .map((col) => `${col.name} (${col.type})`)
    .join(', ');

  const systemInstruction = `You are an expert MongoDB data analyst. Your job is to answer natural language questions about a dataset.
You must return a single valid JSON object containing exactly two keys: "explanation" and "pipeline".
1. "explanation": A friendly, conversational text answering the user's question. If the user asks a general question like "What is this data about?", describe the dataset based on the schema and sample data. If you are generating a query, briefly explain what the query will calculate.
2. "pipeline": A MongoDB aggregation pipeline (JSON array) to fetch the data needed to answer the question. If no query is needed (e.g. for general questions), set this to null. Example: [{"$match": {"status": "A"}}, {"$group": {"_id": "$item", "total": {"$sum": "$amount"}}}]

DO NOT include any write operations (no $out, $merge) in the pipeline.
The pipeline will be executed on the collection: "${collectionName}".
Use the provided schema and sample data to understand the fields and data types: ${schemaDescription}.

You MUST wrap the JSON object in a markdown code block (\`\`\`json ... \`\`\`).`;

  const promptContext = `
Collection Name: ${collectionName}
Schema: ${schemaDescription}
Sample Data: ${JSON.stringify(sampleRows, null, 2)}

User Question: ${question}
Response JSON Object:`;

  const modelsToTry = [
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-2.5-flash-lite',
    'gemma-4-31b-it',
    'gemini-pro-latest'
  ];

  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContext,
          config: {
              systemInstruction: systemInstruction,
          }
      });
      const text = response.text || '';
      
      // Extract JSON from markdown code block if present
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch && jsonMatch[1]) {
        return jsonMatch[1].trim();
      }
      
      return text.trim();
    } catch (error: any) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
    }
  }
  console.error('Error generating MongoDB pipeline with Gemini after trying all models:', lastError);
  throw new Error('Failed to generate MongoDB query.');
};
