// /frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Exemple from './pages/exemple.tsx';
import GameRoomWordSearch from './pages/gameRoomWordSearch.tsx';
// ... autres imports ...

function App() {
    return (
        // 1. BrowserRouter : Active le routage pour l'application
        <BrowserRouter>
            {/* (Optionnel) Ici, votre barre de navigation ou votre en-tête */}

            {/* 2. Routes : Définition des chemins */}
            <Routes>
                {/*La route racine "/" est définie pour afficher HomePage */}
                <Route path="/" element={<Exemple />} />
                {/* La route est définie avec un paramètre dynamique nommé ':gameId' */}
                <Route path="/game/wordsearch/:gameId" element={<GameRoomWordSearch />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
