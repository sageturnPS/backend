const express = require('express')
const router = express.Router()
const {
  getAllAdsHandler,
  getAdByIdHandler,
  createAdHandler,
  updateAdHandler,
  deleteAdHandler,
  getAdDatesHandler,
  findAdsByStoreHandler,
  findAdsByBannerHandler,
  findAdsByProductHandler,
  findAdsByStatusHandler,
  findAdsByDateHandler,
  assignAdToPlaylistHandler,
  assignAdDatesHandler,
  removeAdDatesHandler,
  findAdsByPlaylistHandler,
} = require('../controllers/adController')
const { clearBadLinks } = require('../models/adModel')
const authMiddleware = require('../utils/authMiddleware')

router.get('/get-all', authMiddleware, getAllAdsHandler)
router.get('/get-id/:id', authMiddleware, getAdByIdHandler)
router.post('/new', authMiddleware, createAdHandler)
router.put('/update/:id', authMiddleware, updateAdHandler)
router.delete('/delete/:id', authMiddleware, deleteAdHandler)
router.get('/get-dates/:id', authMiddleware, getAdDatesHandler)
router.get('/store/:store_id', authMiddleware, findAdsByStoreHandler)
router.get('/banner/:banner', authMiddleware, findAdsByBannerHandler)
router.get('/product/:product_id', authMiddleware, findAdsByProductHandler)
router.get('/status/:ad_status', authMiddleware, findAdsByStatusHandler)
router.get('/date/:date', authMiddleware, findAdsByDateHandler)
router.get('/playlist/:playlist_id', authMiddleware, findAdsByPlaylistHandler)
router.post(
  '/:ad_id/playlist/:playlist_id',
  authMiddleware,
  assignAdToPlaylistHandler
)
router.post('/assign-dates/:ad_id', authMiddleware, assignAdDatesHandler)
router.post('/remove-dates/:ad_id', authMiddleware, removeAdDatesHandler)
router.get('/clear-bad-links', clearBadLinks)

module.exports = router
