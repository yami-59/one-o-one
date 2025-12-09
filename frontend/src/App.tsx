// /frontend/src/App.tsx

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import Exemple from './pages/exemple.tsx';
import GameRoomWordSearch from './pages/gameRoomWordSearch.tsx';
import AdminPage from './pages/AdminPage'; 
import GamePage from './pages/GamePage';
import LobbyPage from './pages/LobbyPage';
import Example from './pages/example';
function App() {
    return (
        // 1. BrowserRouter : Active le routage pour l'application
        <BrowserRouter>


            {/* 2. Routes : Définition des chemins */}
            <Routes>

                <Route path="/lobby" element={<LobbyPage />} />
                <Route path="/game/:id" element={<GamePage />} />
                <Route path="/admin" element={<AdminPage />} /> 
                
                {/* Redirections par défaut */}
                <Route path="/" element={<Navigate to="/lobby" replace />} />
                <Route path="*" element={<Navigate to="/lobby" replace />} />
                <Route path="/example" element={<Example></Example>} />
                {/*La route racine "/" est définie pour afficher HomePage */}
                {/* <Route path="/" element={<Exemple />} /> */}
                {/* La route est définie avec un paramètre dynamique nommé ':gameId' */}
                <Route path="/game/wordsearch/:gameId" element={<GameRoomWordSearch />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
