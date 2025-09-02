// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { SettingsProvider } from './context/SettingsContext';
import { supabase } from './lib/supabase'; // si tu veux fournir links initiaux

createRoot(document.getElementById('root')!).render(
  //<StrictMode>
  <SettingsProvider links={[]}> {/* ou links initiaux si tu veux */}
    <App />
  </SettingsProvider>
  //</StrictMode>
);
