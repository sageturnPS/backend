const express = require('express')
const {
  register,
  login,
  logout,
  getUserProfile,
  setPreferredStore,
} = require('../controllers/userController')
const authMiddleware = require('../utils/authMiddleware')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', authMiddleware, logout)
router.get('/profile', authMiddleware, getUserProfile)
router.put('/set-pref/:pref_store', authMiddleware, setPreferredStore)

module.exports = router
