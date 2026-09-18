import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import EStampPortal from './components/EStampPortal';
import PublicStampVerification from './components/PublicStampVerification';
import Login from './components/Login';

function App() {
    return (
        <Router>
            <div className="App min-h-screen">
                <Routes>
                    <Route path="/" element={<EStampPortal />} />
                    <Route
                        path="/eStampCitizenPortal/GeneratePDF/StampVerification"
                        element={<PublicStampVerification />}
                    />
                    <Route
                        path="/eStampCitizenPortal/Account/Login"
                        element={<Login />}
                    />
                    <Route path="*" element={<EStampPortal />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
