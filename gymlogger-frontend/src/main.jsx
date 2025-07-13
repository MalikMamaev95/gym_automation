// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Import your Tailwind CSS setup
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports'; // Import your Amplify configuration
// Import AuthProvider from App.jsx to wrap the App component
import { AuthProvider } from './App.jsx'; // NEW: Import AuthProvider

// Configure Amplify using the aws-exports.js file
Amplify.configure(awsExports);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* NEW: Wrap your App with AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);