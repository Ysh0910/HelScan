const express = require('express');
const router  = express.Router();
const { getRider, createRider, downloadQR, updateRider } = require('../controllers/riderController');
const requireAuth = require('../middleware/requireAuth');

router.get('/rider/:id',       getRider);
router.post('/riderform',      requireAuth, createRider);
router.get('/download-qr/:id', downloadQR);
router.patch('/rider/:id',     requireAuth, updateRider);

module.exports = router;
