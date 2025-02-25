const Auction = require("../models/Auction");

exports.createAuction = async (req, res) => {
    try {
        const { itemName, description, startingBid, closedTime } = req.body;
        if (!itemName || !description || !startingBid || !closedTime) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newItem = new Auction({
            itemName,
            description,
            currentBid: startingBid,
            highestBid: startingBid,
            closedTime
        });

        await newItem.save();
        res.status(201).json({ message: "Auction Created", item: newItem });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getAllAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find();
        res.json(auctions);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getAuctionById = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ message: "Auction not found" });
        res.json(auction);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.placeBid = async (req, res) => {
    try {
        const { bidAmount } = req.body;
        const auction = await Auction.findById(req.params.id);

        if (!auction) return res.status(404).json({ message: "Auction not found" });

        if (auction.isClosed || new Date() > new Date(auction.closedTime)) {
            auction.isClosed = true;
            await auction.save();
            return res.status(400).json({ message: "Auction is closed", winner: auction.highestBid });
        }

        if (bidAmount <= auction.currentBid) {
            return res.status(400).json({ message: "Bid must be higher than the current bid" });
        }

        auction.currentBid = bidAmount;
        auction.highestBid = bidAmount;
        await auction.save();

        res.json({ message: "Bid placed successfully", currentBid: auction.currentBid });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.updateAuction = async (req, res) => {
    try {
        const updatedAuction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedAuction) return res.status(404).json({ message: "Auction not found" });

        res.json({ message: "Auction updated successfully", updatedAuction });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.deleteAuction = async (req, res) => {
    try {
        const deletedAuction = await Auction.findByIdAndDelete(req.params.id);

        if (!deletedAuction) return res.status(404).json({ message: "Auction not found" });

        res.json({ message: "Auction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};