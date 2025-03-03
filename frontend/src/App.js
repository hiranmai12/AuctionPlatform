import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';

import Signin from './components/Signin';
import Dashboard from './components/Dashboard';
import AuctionItem from './components/AuctionItem';
import PostAuction from './components/PostAuction';
import LandingPage from './components/LandingPage';
import Signup from './components/Signup';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/signin" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    window.location.href = "/signin"; // Redirect to Signin
  };

  return (
    <Router>
      <div className="app">
        <header>
          <h1>AuctionEdge</h1>
          <nav>
            {!isAuthenticated ? (
              <>
                <Link to="/signup" className="nav-link">Signup</Link>
                <Link to="/signin" className="nav-link">Signin</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/post-auction" className="nav-link">Post Auction</Link>
                <button style={{ marginLeft: '10px', background: 'red', color: 'white' }} onClick={handleLogout} className="nav-link logout-button">
                  Logout
                </button>
              </>
            )}
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />
            <Route path="/auction/:id" element={<AuctionItem />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/post-auction" element={<ProtectedRoute><PostAuction /></ProtectedRoute>} />
          </Routes>
        </main>

        <footer>
          <p>&copy; 2024 AuctionEdge. All rights reserved.</p>
          <p>Welcome to the best place to buy and sell items through auctions!</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
