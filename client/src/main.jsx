import React from 'react';
import { createRoot } from 'react-dom/client';
import App, { agents } from './App.jsx';
import Gunplay, { techniques as gunplayTechniques } from './Gunplay.jsx';
import Movement, { movementTechniques } from './Movement.jsx';
import { SearchProvider } from './Search.jsx';
import Auth from './Auth.jsx';
import GuidePosts from './GuidePosts.jsx';
import './style.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SearchProvider sources={{ agents, gunplayTechniques, movementTechniques }}>
      {window.location.pathname.startsWith('/auth') ? <Auth /> : window.location.pathname.startsWith('/gunplay') ? <Gunplay /> : window.location.pathname.startsWith('/movement') ? <Movement /> : window.location.pathname.startsWith('/guides') || window.location.pathname === '/economy' || window.location.pathname.startsWith('/economy/') || window.location.pathname === '/admin/guides' ? <GuidePosts /> : <App />}
    </SearchProvider>
  </React.StrictMode>,
);
