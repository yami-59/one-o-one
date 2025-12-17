import { createRoot } from 'react-dom/client';
import './global.css';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';

createRoot(document.getElementById('root')!).render(
        <AuthProvider>
            <App />
        </AuthProvider>
);
