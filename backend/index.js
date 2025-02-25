const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

app.use('/users', require('./routes/userRoutes'));
app.use('/auctions', require('./routes/auctionRoutes'));

app.listen(8000, () => {
    console.log("Server running on port 8000");
});
