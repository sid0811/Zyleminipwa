// Simple test component to verify React is rendering
import React from 'react';

const TestApp = () => {
  console.log('🧪 TestApp rendering...');
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red' }}>🧪 TEST APP - If you see this, React is working!</h1>
      <p>This is a test to verify React rendering works.</p>
      <p>If you see this, the issue is in App.tsx or Routes.tsx</p>
    </div>
  );
};

export default TestApp;



