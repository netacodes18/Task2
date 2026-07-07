import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card, CardContent, Typography, TextField, Button,
  CircularProgress, IconButton, Paper, Tabs, Tab, Box, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { Send, Table as TableIcon, BarChart2, Code, ChevronDown } from 'lucide-react';
import DataTable from '../components/DataTable';
import ChartViewer from '../components/ChartViewer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
  fields?: any[];
}

export default function ChatPage() {
  const { datasetId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [datasetMeta, setDatasetMeta] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (datasetId) {
      fetchDatasetMeta(datasetId);
      // Clear previous chat when dataset changes
      setMessages([]);
    }
  }, [datasetId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchDatasetMeta = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/api/datasets/${id}`);
      setDatasetMeta(res.data);
    } catch (err) {
      console.error('Failed to fetch dataset metadata');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !datasetId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/query`, {
        datasetId,
        question: userMessage.content
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.explanation || `Here are the results for: "${userMessage.content}"`,
        sql: res.data.sql,
        data: res.data.results,
        fields: res.data.fields
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: err.response?.data?.error || 'An error occurred while executing the query.',
        sql: err.response?.data?.sql
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!datasetId) {
    return <div className="p-8 text-center text-gray-500">Please select a dataset from the Upload page first.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
        <Typography variant="h6" className="font-semibold text-gray-800">
          Chatting with: <span className="text-primary">{datasetMeta?.name || 'Loading...'}</span>
        </Typography>
        {datasetMeta && (
          <Typography variant="body2" className="text-gray-500">
            {datasetMeta.row_count} rows • File: {datasetMeta.original_filename}
          </Typography>
        )}
      </div>

      {/* Chat History */}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 my-auto">
            <Typography variant="h6">Ask me anything about this dataset!</Typography>
            <Typography variant="body2" className="mt-2 mb-6">Here are some questions you can ask about any dataset:</Typography>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
              {[
                "What is this data about?",
                "Show me the top 5 records.",
                "Count the total number of rows.",
                "Are there any empty or missing values?",
                "Summarize the most common values."
              ].map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 shadow-sm text-gray-800'}`}>
              <Typography variant="body1" className="mb-2">{msg.content}</Typography>
              
              {msg.sql && (
                <Accordion className="mt-2 !shadow-none border border-gray-200 before:hidden">
                  <AccordionSummary expandIcon={<ChevronDown size={16} />} className="!min-h-0 !py-0 bg-gray-50">
                    <Typography variant="caption" className="flex items-center gap-1 font-mono text-gray-600">
                      <Code size={14} /> View SQL Query
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="bg-gray-900 text-green-400 p-3 font-mono text-xs overflow-x-auto rounded-b">
                    <pre>{msg.sql}</pre>
                  </AccordionDetails>
                </Accordion>
              )}

              {msg.data && msg.fields && msg.data.length > 0 && (
                <div className="mt-4 border border-gray-200 rounded overflow-hidden">
                  <ResultView data={msg.data} fields={msg.fields} />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-3 text-gray-500">
              <CircularProgress size={20} />
              <Typography variant="body2">Analyzing data and generating SQL...</Typography>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask a question about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            size="small"
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={!input.trim() || loading}
            endIcon={<Send size={18} />}
          >
            Ask
          </Button>
        </form>
      </div>
    </div>
  );
}

function ResultView({ data, fields }: { data: any[], fields: any[] }) {
  const [tab, setTab] = useState(0);
  
  return (
    <div className="bg-white">
      <Tabs value={tab} onChange={(_, v) => setTab(v)} className="border-b border-gray-200" sx={{ minHeight: 40 }}>
        <Tab icon={<TableIcon size={16} />} iconPosition="start" label="Data Table" sx={{ minHeight: 40, py: 0 }} />
        <Tab icon={<BarChart2 size={16} />} iconPosition="start" label="Chart" sx={{ minHeight: 40, py: 0 }} />
      </Tabs>
      <Box className="p-2">
        {tab === 0 ? (
          <DataTable data={data} fields={fields} />
        ) : (
          <ChartViewer data={data} fields={fields} />
        )}
      </Box>
    </div>
  );
}
