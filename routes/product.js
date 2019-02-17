const express = require('express');

const productController = require('../controllers/product');

const router = express.Router();

router.get('/items', productController.getProduct);

module.exports = router;
