const express = require("express");
const Auction = require("../models/auctionModel");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// Add Auction
router.post("/", authenticateToken, async (req, res) => {
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
router.put("/:id", authenticateToken, async (req, res) => {
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
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findByIdAndDelete(id);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    res.json({ message: "Auction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Auctions
router.get("/", async (req, res) => {
  try {
    const auctions = await Auction.find();
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get Single Auction
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    res.json(auction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
