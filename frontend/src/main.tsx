import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

import { getSessionId } from './utils/session';

// Retrieve session ID
const sessionId = getSessionId();

// Add interceptor to append session ID to all requests
axios.interceptors.request.use((config) => {
  if (sessionId) {
    config.headers['x-session-id'] = sessionId;
  }
  return config;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
