import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Immediate visible feedback
console.log('🚀 main.tsx: Starting...');

// Check if root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red; font-size: 20px;">❌ Error: Root element not found. Please check index.html</div>';
} else {
  console.log('✅ Root element found');
  
  // Render immediately visible content
  try {
    console.log('🔄 Attempting to render App...');
    
    // Render a simple loading message first
    rootElement.innerHTML = '<div style="padding: 20px; background: #4CAF50; color: white; font-size: 18px;">🔄 Loading App...</div>';
    
    // Then try to load and render the actual App
    import('./App')
      .then(({ default: App }) => {
        console.log('✅ App imported successfully');
        ReactDOM.createRoot(rootElement).render(
          <React.StrictMode>
            <App />
          </React.StrictMode>
        );
        console.log('✅ App rendered successfully');
      })
      .catch((error) => {
        console.error('❌ Error importing App:', error);
        rootElement.innerHTML = `<div style="padding: 20px; color: red; font-size: 16px;">
          <h2>❌ Error Loading App</h2>
          <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
          <details style="margin-top: 10px;">
            <summary>Stack Trace</summary>
            <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
          </details>
        </div>`;
      });
  } catch (error) {
    console.error('❌ Error in main.tsx:', error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red; font-size: 16px;">
      <h2>❌ Fatal Error</h2>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : String(error)}</p>
      <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error instanceof Error ? error.stack : 'No stack trace'}</pre>
    </div>`;
  }
}

