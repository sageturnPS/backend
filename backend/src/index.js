const express = require('express')
const dotenv = require('dotenv')

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const adRoutes = require('./routes/adRoutes')
const storeRoutes = require('./routes/storeRoutes')
const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const playlistRoutes = require('./routes/playlistRoutes')

const app = express()

// Load environment variables
dotenv.config()
const port = process.env.PORT || 3001

// Set cors options

const corsOptions = {
  origin: 'https://frontend-gowa.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}
app.use(cors(corsOptions))
// app.options('*', cors(corsOptions))
app.disable('x-powered-by')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json())

// * Main Website Routes
app.use('/api/ads', adRoutes)
app.use('/api/user', userRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/products', productRoutes)
app.use('/api/playlists', playlistRoutes)

app.listen(port, () => {
  console.log(`Server is running. Listening on port ${port}`)
})
