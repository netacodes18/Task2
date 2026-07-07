import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import SidebarLayout from './components/SidebarLayout';
import './index.css';

function AppLayout() {
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<UploadPage />} />

        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:datasetId" element={<ChatPage />} />
      </Routes>
    </SidebarLayout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={<AppLayout />} />
        {/* Keep legacy routes working */}

        <Route path="/chat" element={<AppLayout />} />
        <Route path="/chat/:datasetId" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
