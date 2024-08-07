const pool = require('../config/db')

const getAllProducts = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product')
    return rows
  } catch (error) {
    throw error
  }
}

const getProductById = async (id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Product WHERE id = ?', [id])
    return rows[0]
  } catch (error) {
    throw error
  }
}

const getProductByName = async (name) => {
  const connection = await pool.getConnection()
  const sql = 'SELECT * FROM Product WHERE name = ?'

  try {
    const [rows] = await connection.execute(sql, [name])
    console.log(`Retrieved products with name ${name}:`, rows)
    return rows
  } catch (error) {
    console.error('Error retrieving products by name:', error)
  } finally {
    connection.release()
  }
}

const getProductByCategory = async (category) => {
  const connection = await pool.getConnection()
  const sql = 'SELECT * FROM Product WHERE category = ?'

  try {
    const [rows] = await connection.execute(sql, [category])
    console.log(`Retrieved products in category ${category}:`, rows)
    return rows
  } catch (error) {
    console.error('Error retrieving products by category:', error)
  } finally {
    connection.release()
  }
}

const updateProduct = async (id, updatedProduct) => {
  const connection = await pool.getConnection()
  const sql = `
    UPDATE Product
    SET name = ?, category = ?
    WHERE id = ?
  `

  try {
    const [result] = await connection.execute(sql, [
      updatedProduct.name,
      updatedProduct.category,
      id,
    ])

    if (result.affectedRows === 0) {
      console.log('Product not found or not updated:', id)
      return null
    }

    console.log('Updated product:', updatedProduct)
    return updatedProduct
  } catch (error) {
    console.error('Error updating product:', error)
  } finally {
    connection.release()
  }
}

const createProduct = async ({ name, category }) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO Product (name, category) VALUES (?, ?)',
      [name, category]
    )
    const newProduct = {
      id: result.insertId,
      name,
      category,
    }
    return newProduct
  } catch (error) {
    throw error
  }
}

const deleteProduct = async (id) => {
  const connection = await pool.getConnection()
  const sql = 'DELETE FROM Product WHERE id = ?'

  try {
    const [result] = await connection.execute(sql, [id])

    if (result.affectedRows === 0) {
      console.log('Product not found or not deleted:', id)
      return false
    }

    console.log('Deleted product with id:', id)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
  } finally {
    connection.release()
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  getProductByCategory,
  getProductByName,
  updateProduct,
  deleteProduct,
}
