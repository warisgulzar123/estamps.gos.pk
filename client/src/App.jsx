import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EStampPortal from './components/EStampPortal';
import PublicStampVerification from './components/PublicStampVerification';
import Login from './components/Login';
import LoginGate from './components/LoginGate';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        try {
            return localStorage.getItem('isAuthenticated') === 'true';
        } catch (e) {
            return false;
        }
    });

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem('isAuthenticated');
        } catch (e) {}
        setIsAuthenticated(false);
    };

    const ProtectedPortal = isAuthenticated ? (
        <EStampPortal onLogout={handleLogout} />
    ) : (
        <LoginGate onLoginSuccess={handleLoginSuccess} />
    );

    return (
        <Router>
            <div className="App min-h-screen">
                <Routes>
                    <Route path="/" element={ProtectedPortal} />
                    <Route
                        path="/eStampCitizenPortal/GeneratePDF/StampVerification"
                        element={<PublicStampVerification />}
                    />
                    <Route
                        path="/verify/:id"
                        element={<PublicStampVerification />}
                    />
                    <Route
                        path="/verify"
                        element={<PublicStampVerification />}
                    />
                    <Route
                        path="/verification"
                        element={<PublicStampVerification />}
                    />
                    <Route
                        path="/eStampCitizenPortal/Account/Login"
                        element={<Login />}
                    />
                    <Route path="*" element={ProtectedPortal} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
