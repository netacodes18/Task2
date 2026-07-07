import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });



const modelsToTry = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite-preview-02-05',
  'gemini-1.5-flash'
];

async function callGeminiJSON(systemInstruction: string, promptContext: string): Promise<string> {
  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContext,
          config: { systemInstruction }
      });
      const text = response.text || '';
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
  console.error('Error with Gemini after trying all models:', lastError);
  throw new Error('Failed to generate response from LLM.');
}

export const generateMongoPipeline = async (
  question: string,
  collectionName: string,
  schema: any[],
  sampleRows: any[] = []
): Promise<string> => {
  const schemaDescription = schema.map((col) => `${col.name} (${col.type})`).join(', ');

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

  return callGeminiJSON(systemInstruction, promptContext);
};

export const generateDashboardConfig = async (
  collectionName: string,
  schema: any[],
  sampleRows: any[] = []
): Promise<string> => {
  const schemaDescription = schema.map((col) => `${col.name} (${col.type})`).join(', ');

  const systemInstruction = `You are an expert Data Scientist and MongoDB analyst.
Your job is to automatically design a rich, insightful analytics dashboard for a dataset.
You must return a SINGLE valid JSON object with exactly two keys: "kpis" and "charts".

"kpis" must be an array of exactly 4 objects:
{ "title": "Metric Name (e.g. Total Sales)", "pipeline": [MongoDB aggregation pipeline that returns a single document with a 'value' field] }

"charts" must be an array of exactly 3 objects:
1 Bar chart: { "title": "Chart Title", "type": "bar", "xAxisKey": "...", "yAxisKey": "...", "pipeline": [...] }
1 Pie chart: { "title": "Chart Title", "type": "pie", "nameKey": "...", "valueKey": "...", "pipeline": [...] }
1 Line chart: { "title": "Chart Title", "type": "line", "xAxisKey": "...", "yAxisKey": "...", "pipeline": [...] }

Rules for pipelines:
- DO NOT use write operations ($out, $merge).
- Keep queries highly performant (use $limit where appropriate, max 50 rows for charts).
- The pipeline will be executed on the collection: "${collectionName}".
- Use the provided schema and sample data to understand the fields and data types: ${schemaDescription}.
- For KPIs, ensure the pipeline outputs a field named 'value'. (e.g. {"$group": {"_id": null, "value": {"$sum": "$amount"}}}).

You MUST wrap the JSON object in a markdown code block (\`\`\`json ... \`\`\`).`;

  const promptContext = `
Collection Name: ${collectionName}
Schema: ${schemaDescription}
Sample Data: ${JSON.stringify(sampleRows, null, 2)}

Generate the dashboard JSON Object:`;

  return callGeminiJSON(systemInstruction, promptContext);
};
