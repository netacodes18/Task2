import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'

import { getSessionId } from './utils/session';

// Add interceptor to append session ID to all requests
axios.interceptors.request.use((config) => {
  const currentSessionId = getSessionId();
  if (currentSessionId) {
    config.headers['x-session-id'] = currentSessionId;
  }
  return config;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
