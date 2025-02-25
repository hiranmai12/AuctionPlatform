const express = require('express');
const {
    createAuction,
    getAllAuctions,
    getAuctionById,
    updateAuction,
    deleteAuction
} = require('../controllers/auctionController');

const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authenticate, createAuction);
router.get('/', getAllAuctions);
router.get('/:id', getAuctionById);
router.put('/:id', authenticate, updateAuction);
router.delete('/:id', authenticate, deleteAuction);

module.exports = router;
