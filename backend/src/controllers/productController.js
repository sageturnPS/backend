const {
  getAllProducts,
  getProductById,
  getProductByCategory,
  getProductByName,
  updateProduct,
  createProduct,
  deleteProduct,
} = require('../models/productModel')

// ? GET handlers
const getAllProductsHandler = async (req, res) => {
  try {
    const products = await getAllProducts()
    res.json(products)
  } catch (error) {
    console.error('Server error: ', error)
  }
}

const getProductByIdHandler = async (req, res) => {
  const { id } = req.params
  try {
    const product = await getProductById(id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

const getProductByNameHandler = async (req, res) => {
  const { name } = req.params
  try {
    const products = await getProductByName(name)
    res.json(products)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

const getProductByCategoryHandler = async (req, res) => {
  const { category } = req.params
  try {
    const products = await getProductByCategory(category)
    res.json(products)
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ? PUT/PATCH Handlers
const updateProductHandler = async (req, res) => {
  const { id } = req.params
  const updatedProduct = req.body
  try {
    const result = await updateProduct(id, updatedProduct)
    if (!result) {
      return res.status(404).json({ error: 'Product not found or not updated' })
    }
    res.json({ message: 'Product updated successfully', updatedProduct })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

// ? POST Handler
const createProductHandler = async (req, res) => {
  const { name, category } = req.body

  try {
    const newProduct = await createProduct({
      name,
      category,
    })
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ? DELETE Handler
const deleteProductHandler = async (req, res) => {
  const { id } = req.params
  try {
    const result = await deleteProduct(id)
    if (!result) {
      return res.status(404).json({ error: 'Product not found or not deleted' })
    }
    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Server error' })
  }
}

module.exports = {
  getAllProductsHandler,
  getProductByIdHandler,
  updateProductHandler,
  createProductHandler,
  deleteProductHandler,
  getProductByCategoryHandler,
  getProductByNameHandler,
}
