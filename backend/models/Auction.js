const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema({
    itemName: String,
    description: String,
    currentBid: Number,
    highestBid: Number,
    closedTime: Date,
    isClosed: { type: Boolean, default: false }
});

module.exports = mongoose.model("Auction", auctionSchema);
