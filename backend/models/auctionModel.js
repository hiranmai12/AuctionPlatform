const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
  itemName: String,
  startingBid: Number,
  currentBid: { type: Number, default: 0 },
  highestBidder: { type: String, default: "" },
  endTime: Date,
  isClosed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Auction", auctionSchema);
