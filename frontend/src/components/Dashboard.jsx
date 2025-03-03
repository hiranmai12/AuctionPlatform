import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/signin'); // Redirect to signin if not authenticated
      return;
    }

    const fetchAuctions = async () => {
      try {
        const res = await axios.get('http://localhost:5000/auctions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuctions(res.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/signin');
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate('/post-auction')}>Post New Auction</button>

      {loading ? (
        <p>Loading auctions...</p>
      ) : auctions.length === 0 ? (
        <p>No auctions available.</p>
      ) : (
        <ul>
          {auctions.map((auction) => (
            <li key={auction.id}>
              <Link to={`/auction/${auction.id}`}>
                <h3>{auction.itemName}</h3>
              </Link>
              <p>Starting Bid: ${auction.startingBid}</p>
              <p>Current Bid: ${auction.currentBid || 'No bids yet'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
