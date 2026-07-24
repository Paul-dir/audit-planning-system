import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './styles/common.css';

// Initialize theme before React renders - DEFAULT TO LIGHT MODE
(() => {
  const stored = localStorage.getItem('theme');
  let isDark = false; // Changed to false - light mode is default
  
  if (stored) {
    isDark = stored === 'dark';
  } else {
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  
  const html = document.documentElement;
  if (isDark) {
    html.classList.add('dark');
    html.classList.remove('light');
  } else {
    html.classList.add('light');
    html.classList.remove('dark');
  }
  
  document.body.classList.toggle('dark', isDark);
  document.body.classList.toggle('light', !isDark);
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
