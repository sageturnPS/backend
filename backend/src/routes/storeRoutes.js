const express = require('express')
const router = express.Router()
const {
  getStores,
  getStoreById,
  getStoreByName,
  getStoresByAd,
  getStoresByState,
  getStoresByBanner,
} = require('../controllers/storeController')
const authMiddleware = require('../utils/authMiddleware')

router.get('/get-all', authMiddleware, getStores)
router.get('/get-id/:id', authMiddleware, getStoreById)
router.get('/name/:name', authMiddleware, getStoreByName)
router.get('/ad/:ad_id', authMiddleware, getStoresByAd)
router.get('/state/:state', authMiddleware, getStoresByState)
router.get('/banner/:banner', authMiddleware, getStoresByBanner)

module.exports = router
