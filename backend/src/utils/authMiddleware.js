const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config() // Make sure to call config to load the environment variables
const { addToBlacklist, isInBlacklist } = require('../utils/tokenBlacklist');

const SECRET_KEY = process.env.JWT_SECRET

if (!SECRET_KEY) {
  throw new Error('JWT_SECRET is not defined in environment variables')
}

const authMiddleware = (req, res, next) => {
  console.log('AuthMiddleware called')

  const authHeader = req.header('Authorization')

  if (!authHeader) {
    console.error('Authorization header is missing')
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token) {
    console.error('Token is missing after "Bearer "')
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  if (isInBlacklist(token)) {
    console.error('Token has been blacklisted');
    return res.status(401).json({ message: 'Token is no longer valid, please log in again' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY)
    req.user = decoded
    console.log('Auth middleware completed')
    next()
  } catch (error) {
    console.error('Token verification failed:', error.message)
    res.status(401).json({ message: 'Token is not valid' })
  }
}

module.exports = authMiddleware
