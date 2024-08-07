const express = require('express')
const router = express.Router()
const {
  getAllProductsHandler,
  getProductByNameHandler,
  getProductByCategoryHandler,
  getProductByIdHandler,
  updateProductHandler,
  createProductHandler,
  deleteProductHandler,
} = require('../controllers/productController')
const authMiddleware = require('../utils/authMiddleware')

router.get('/get-all', authMiddleware, getAllProductsHandler)
router.get('/get-id/:id', authMiddleware, getProductByIdHandler)
router.get('/get-name/:name', authMiddleware, getProductByNameHandler)
router.get(
  '/get-category/:category',
  authMiddleware,
  getProductByCategoryHandler
)
router.put('/update/:id', authMiddleware, updateProductHandler)
router.post('/new', authMiddleware, createProductHandler)
router.delete('/delete/:id', authMiddleware, deleteProductHandler)

module.exports = router
