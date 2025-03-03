require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
const cors = require('cors');

app.use(cors({ 
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: 'GET,POST,PUT,DELETE', 
  credentials: true // Allow cookies and authentication headers
}));

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/auctionDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Auction Schema & Model
const auctionSchema = new mongoose.Schema({
  itemName: String,
  startingBid: Number,
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: "" },
  endTime: Date,
  isClosed: { type: Boolean, default: false },
});

const Auction = mongoose.model("Auction", auctionSchema);

// Middleware for Authentication
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.status(201).json({ message: "User registered", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Signin
app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add Auction
app.post("/auction", authenticateToken, async (req, res) => {
  try {
    const { itemName, startingBid, endTime } = req.body;
    const newAuction = new Auction({ itemName, startingBid, currentBid: startingBid, endTime });
    await newAuction.save();
    res.status(201).json({ message: "Auction added" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update Auction
app.put("/auction/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.isClosed) return res.status(400).json({ message: "Auction is closed" });

    Object.assign(auction, req.body);
    await auction.save();
    res.json({ message: "Auction updated", auction });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Auction
app.delete("/auction/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findByIdAndDelete(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    res.json({ message: "Auction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Place a Bid
app.post("/bid/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { bidAmount } = req.body;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (new Date() > new Date(auction.endTime)) {
      auction.isClosed = true;
      await auction.save();
      return res.status(400).json({ message: "Auction is closed" });
    }

    if (bidAmount <= auction.currentBid) {
      return res.status(400).json({ message: "Bid must be higher" });
    }

    auction.currentBid = bidAmount;
    auction.highestBidder = req.user.userId;
    await auction.save();

    res.json({ message: "Bid placed successfully", auction });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Auctions
app.get("/auctions", async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Single Auction
app.get("/auctions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update User
app.put("/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    Object.assign(user, req.body);
    await user.save();
    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete User
app.delete("/user/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
