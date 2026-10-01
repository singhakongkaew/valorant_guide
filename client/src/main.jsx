import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { agents } from './App.jsx';
import Gunplay, { techniques as gunplayTechniques } from './Gunplay.jsx';
import Movement, { movementTechniques } from './Movement.jsx';
import { SearchProvider } from './Search.jsx';
import './style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SearchProvider sources={{ agents, gunplayTechniques, movementTechniques }}>
      {window.location.pathname.startsWith('/gunplay') ? <Gunplay /> : window.location.pathname.startsWith('/movement') ? <Movement /> : <App />}
    </SearchProvider>
  </React.StrictMode>,
);

