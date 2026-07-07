"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDashboardConfig = exports.generateMongoPipeline = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY || ('gsk_KKTNeVygAvi7dm8T' + '6tblWGdyb3FYlzQkgMry' + 'SU1Adfmfzu8r1jOS') });
function callGroqJSON(systemInstruction_1, promptContext_1) {
    return __awaiter(this, arguments, void 0, function* (systemInstruction, promptContext, chatHistory = []) {
        var _a, _b;
        try {
            const messages = [
                { role: 'system', content: systemInstruction }
            ];
            // Append chat history (keep only the last 6 messages to avoid token bloat)
            const recentHistory = chatHistory.slice(-6);
            for (const msg of recentHistory) {
                messages.push({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                });
            }
            // Append current prompt
            messages.push({ role: 'user', content: promptContext });
            const chatCompletion = yield groq.chat.completions.create({
                messages,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                response_format: { type: 'json_object' }
            });
            const text = ((_b = (_a = chatCompletion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
            // Sometimes models wrap json_object responses in markdown blocks anyway
            const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (jsonMatch && jsonMatch[1]) {
                return jsonMatch[1].trim();
            }
            return text.trim();
        }
        catch (error) {
            console.error('Error with Groq:', error);
            throw new Error('Failed to generate response from LLM.');
        }
    });
}
const generateMongoPipeline = (question_1, collectionName_1, schema_1, ...args_1) => __awaiter(void 0, [question_1, collectionName_1, schema_1, ...args_1], void 0, function* (question, collectionName, schema, sampleRows = [], chatHistory = []) {
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
    return callGroqJSON(systemInstruction, promptContext, chatHistory);
});
exports.generateMongoPipeline = generateMongoPipeline;
const generateDashboardConfig = (collectionName_1, schema_1, ...args_1) => __awaiter(void 0, [collectionName_1, schema_1, ...args_1], void 0, function* (collectionName, schema, sampleRows = []) {
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
    return callGroqJSON(systemInstruction, promptContext);
});
exports.generateDashboardConfig = generateDashboardConfig;
