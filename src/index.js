import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Create a root for ReactDOM
const root = ReactDOM.createRoot(rootElement);

// Render the App component inside StrictMode
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
