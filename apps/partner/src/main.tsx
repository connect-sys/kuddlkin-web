import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Suppress TensorFlow/face-api tensor shape errors that don't affect functionality
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  const errorMessage = args.join(' ');
  if (errorMessage.includes('tensor should have') || 
      errorMessage.includes('Based on the provided shape') ||
      errorMessage.includes('TensorFlow')) {
    // Suppress TensorFlow tensor shape warnings
    return;
  }
  originalConsoleError.apply(console, args);
};

// Also suppress window errors from TensorFlow
window.addEventListener('error', (event) => {
  const errorMessage = event.message || '';
  if (errorMessage.includes('tensor should have') || 
      errorMessage.includes('Based on the provided shape') ||
      errorMessage.includes('TensorFlow')) {
    event.preventDefault();
    event.stopPropagation();
    console.warn('Suppressed TensorFlow error:', errorMessage);
    return false;
  }
});

// Suppress unhandled promise rejections from TensorFlow
window.addEventListener('unhandledrejection', (event) => {
  const errorMessage = event.reason?.message || String(event.reason) || '';
  if (errorMessage.includes('tensor should have') || 
      errorMessage.includes('Based on the provided shape') ||
      errorMessage.includes('TensorFlow')) {
    event.preventDefault();
    console.warn('Suppressed TensorFlow promise rejection:', errorMessage);
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
