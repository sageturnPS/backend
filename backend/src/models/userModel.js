const pool = require('../config/db')
const {
  v4: uuidv4,
  parse: uuidParse,
  stringify: uuidStringify,
} = require('uuid')
const { use } = require('../routes/adRoutes')

// ? Helper Functions ? //

const uuidToBinary = (uuid) => {
  return Buffer.from(uuidParse(uuid))
}

const binaryToUuid = (binary) => {
  return uuidStringify(binary)
}

// ? End Helper Functions ? //

const findUserByUsername = async (username) => {
  try {
    console.log('Querying user with username:', username)
    const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [
      username,
    ])

    if (rows.length === 0) {
      console.log('No user found with the given username.')
      return null
    }
    return rows[0]
  } catch (error) {
    console.error('Error finding user by username:', error.message)
    throw error
  }
}

const findUserById = async (id) => {
  const binaryId = uuidToBinary(id)

  try {
    // Fetch user details
    const [userRows] = await pool.query('SELECT * FROM User WHERE id = ?', [
      binaryId,
    ])

    if (userRows.length === 0) {
      return null // User not found
    }

    // Fetch associated stores
    const [storeRows] = await pool.query(
      'SELECT store_id, is_preferred FROM Store_User WHERE user_id = ?',
      [binaryId]
    )

    // Extract stores and preferred store ID
    const stores = storeRows.map((row) => ({
      store_id: row.store_id,
      is_preferred: row.is_preferred === 1, // Convert 1/0 to true/false
    }))

    // Find preferred store ID
    let preferredStoreId = null
    for (const store of stores) {
      if (store.is_preferred) {
        preferredStoreId = store.store_id
        break
      }
    }

    return {
      ...userRows[0],
      stores: stores.map((store) => store.store_id), // Only store the store_id in user object
      preferred_store_id: preferredStoreId, // Add preferred store ID to user object
    }
  } catch (error) {
    console.error('Error finding user by id:', error.message)
    throw error
  }
}

const createUser = async (user, store_ids, pref_store) => {
  let connection
  try {
    // Start transaction
    connection = await pool.getConnection()
    await connection.beginTransaction()

    // Insert into User table
    await connection.query(
      'INSERT INTO User (id, first_name, last_name, role, is_auth, profile_photo, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        user.first_name,
        user.last_name,
        user.role,
        user.is_auth,
        user.profile_photo,
        user.username,
        user.password,
      ]
    )

    // Insert into store_user table for each store_id
    for (const store_id of store_ids) {
      // Determine if this store should be set as preferred
      const is_preferred = store_id === pref_store

      await connection.query(
        'INSERT INTO Store_User (user_id, store_id, is_preferred) VALUES (?, ?, ?)',
        [user.id, store_id, is_preferred]
      )
    }

    // Commit transaction
    await connection.commit()

    // Return the created user object
    return { ...user }
  } catch (e) {
    // Rollback transaction if there's an error
    if (connection) {
      await connection.rollback()
    }
    console.error('Creation Error: ', e)
    throw e // rethrow the error to the caller
  } finally {
    // Release the connection back to the pool
    if (connection) {
      connection.release()
    }
  }
}

const findUserStores = async (user_id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Store_User', [user_id])
    return rows
  } catch {
    console.error('Error getting user stores')
  }
}

const setPrefStore = async (store_id, user_id) => {
  try {
    await pool.query(
      'UPDATE Store_User SET is_preferred = false WHERE user_id = ?',
      [user_id]
    )
    const [result] = await pool.query(
      'UPDATE Store_User SET is_preferred = true WHERE user_id = ? AND store_id = ?',
      [user_id, store_id]
    )
    return result
  } catch {
    console.error('Error updating preferred store')
  }
}

module.exports = {
  findUserByUsername,
  findUserById,
  createUser,
  uuidToBinary,
  binaryToUuid,
  findUserStores,
  setPrefStore,
}
