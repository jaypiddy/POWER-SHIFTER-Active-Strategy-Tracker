
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

window.onerror = function (message, source, lineno, colno, error) {
  console.error('Global Error:', message, error);
  const errDiv = document.createElement('div');
  errDiv.style.color = 'red';
  errDiv.style.padding = '20px';
  errDiv.innerText = `Runtime Error: ${message}`;
  document.body.appendChild(errDiv);
};

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (e) {
  console.error('Mount Error:', e);
  rootElement.innerText = `Mount Error: ${e}`;
}
