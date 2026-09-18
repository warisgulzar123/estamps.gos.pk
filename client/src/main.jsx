import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Align Axios baseURL to http://localhost:5000 when running standalone or through Vite proxy
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    axios.defaults.baseURL = 'http://localhost:5000';
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
