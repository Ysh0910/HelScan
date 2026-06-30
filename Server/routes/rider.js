const express = require('express');
const router  = express.Router();
const { getRider, createRider, downloadQR } = require('../controllers/riderController');

router.get('/rider/:id',       getRider);
router.post('/riderform',      createRider);
router.get('/download-qr/:id', downloadQR);

module.exports = router;
