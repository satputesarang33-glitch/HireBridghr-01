import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// Import CSS architecture in modular sequence
import './styles/globals.css';
import './styles/liquid-glass.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/candidate.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
