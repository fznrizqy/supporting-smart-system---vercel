import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Optional: if you have global styles, otherwise safe to omit or keep if exists

// Ensure we find the root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to. Check index.html for <div id='root'></div>");
}

const root = ReactDOM.createRoot(rootElement);

// Mount the app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);