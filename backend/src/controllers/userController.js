const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
const {
  findUserByUsername,
  findUserById,
  createUser,
  uuidToBinary,
  binaryToUuid,
  findUserStores,
  setPrefStore,
} = require('../models/userModel')
const { generateJWT } = require('../utils/generateJWT')
const { addToBlacklist } = require('../utils/tokenBlacklist');

const validatePassword = async (inputPassword, storedHash) => {
  return await bcrypt.compare(inputPassword, storedHash)
}

const register = async (req, res) => {
  const {
    first_name,
    last_name,
    role,
    profile_photo,
    username,
    password,
    store_ids,
    pref_store,
  } = req.body
  console.log(first_name, last_name)

  try {
    console.log('Finding by username')
    const userExists = await findUserByUsername(username)
    if (userExists)
      return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: uuidToBinary(uuidv4()),
      first_name,
      last_name,
      role,
      is_auth: 1,
      profile_photo,
      username,
      password: hashedPassword,
    }

    const createdUser = await createUser(newUser, store_ids, pref_store)
    console.log('Created User:', createdUser)

    const token = generateJWT(binaryToUuid(createdUser.id))
    console.log('Generated Token:', token)

    res.status(201).json({
      token,
      user: {
        id: binaryToUuid(createdUser.id),
        name: createdUser.first_name + ' ' + createdUser.last_name,
        role: createdUser.role,
        profile_photo: createdUser.profile_photo,
        username: createdUser.username,
      },
    })
  } catch (error) {
    console.error('Error in register function:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}

const login = async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await findUserByUsername(username)
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await validatePassword(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    user.id = binaryToUuid(user.id)

    const token = generateJWT(user.id)

    res.json({
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_auth: user.is_auth,
        profile_photo: user.profile_photo,
        username: user.username,
      },
    })
  } catch (error) {
    res.status(500).json({ message: 'Invalid credentials' })
  }
}

const logout = async (req, res) => {
  try {
    console.log(req)

    // Clear the JWT cookie
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'Strict',
    })

    res.status(200).json({ message: 'Logout successful' })
  } catch (e) {
    console.error('Error Logging Out: ', e)
    res
      .status(500)
      .json({ message: 'Server error during logout', error: e.message })
  }
}

const getUserProfile = async (req, res) => {
  const userId = req.user.id

  try {
    const user = await findUserById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      id: binaryToUuid(user.id),
      name: user.first_name + ' ' + user.last_name,
      role: user.role,
      profile_photo: user.profile_photo,
      username: user.username,
      stores: user.stores, // Array of associated store IDs
      preferred_store_id: user.preferred_store_id, // Preferred store ID
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const setPreferredStore = async (req, res) => {
  const { id } = req.body
  const userId = uuidToBinary(id)
  const { pref_store } = req.params

  try {
    // Check if the store_id is associated with the user
    const userStores = await findUserStores(userId)
    console.log(userStores)
    console.log(typeof pref_store, pref_store)
    const isUserStore = userStores.some((store) => store.store_id == pref_store)

    if (!isUserStore) {
      return res
        .status(400)
        .json({ message: 'Store not associated with the user' })
    }

    setPrefStore(pref_store, userId)

    res.json({ message: 'Preferred store updated successfully' })
    return true
  } catch (error) {
    console.error('Error setting preferred store:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}

module.exports = {
  register,
  login,
  logout,
  getUserProfile,
  validatePassword,
  uuidToBinary,
  setPreferredStore,
}
