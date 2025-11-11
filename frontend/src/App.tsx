// /frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.tsx'; 

// ... autres imports ...

function App() {
  return (
    // 1. BrowserRouter : Active le routage pour l'application
    <BrowserRouter>
      {/* (Optionnel) Ici, votre barre de navigation ou votre en-tête */}
      
      {/* 2. Routes : Définition des chemins */}
      <Routes>
        {/*La route racine "/" est définie pour afficher HomePage */}
        <Route path="/" element={<HomePage />} /> 
        
        {/* 
        Les autres routes sont accessibles via la navigation, exemple : 
        
        <Route path="/matchmaking" element={<MatchmakingPage />} />
        <Route path="/ranking" element={<RankingPage />} /> 
        
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;