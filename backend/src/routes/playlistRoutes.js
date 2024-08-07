const express = require('express')
const router = express.Router()

const {
  getAllPlaylistsHandler,
  getStorePlaylistsHandler,
  getStorePlaylistByDateHandler,
  getPlaylistByIdHandler,
  getAdPlaylistsHandler,
  createPlaylistHandler,
  deletePlaylistHandler,
  updateOrderInPlaylistHandler
} = require('../controllers/playlistController')
const authMiddleware = require('../utils/authMiddleware')

router.get('/get-all', authMiddleware, getAllPlaylistsHandler)
router.get('/store/:store_id', authMiddleware, getStorePlaylistsHandler)
router.get(
  '/store/:store_id/date/:date',
  authMiddleware,
  getStorePlaylistByDateHandler
)
router.get('/get-id/:id', authMiddleware, getPlaylistByIdHandler)
router.get('/ad/:ad_id', authMiddleware, getAdPlaylistsHandler)
router.post('/new', authMiddleware, createPlaylistHandler)
router.delete('/delete/:id', authMiddleware, deletePlaylistHandler)

module.exports = router
