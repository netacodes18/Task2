import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import SidebarLayout from './components/SidebarLayout';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <SidebarLayout>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard/:datasetId" element={<DashboardPage />} />
          {/* Legacy links that don't have dataset ID selected yet */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:datasetId" element={<ChatPage />} />
        </Routes>
      </SidebarLayout>
    </BrowserRouter>
  );
}

export default App;
