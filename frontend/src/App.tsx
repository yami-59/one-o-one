import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminPage from './pages/AdminPage'; 
import GamePage from './pages/GamePage';
import LobbyPage from './pages/LobbyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/admin" element={<AdminPage />} /> 
        
        {/* Redirections par défaut */}
        <Route path="/" element={<Navigate to="/lobby" replace />} />
        <Route path="*" element={<Navigate to="/lobby" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;