const {
  findAllStores,
  findStoreById,
  findStoreByName,
  findStoresByAd,
  findStoresByState,
  findStoresByBanner,
} = require('../models/storeModel')

// @desc    Get all stores
// @route   GET /api/stores/get-all
const getStores = async (req, res) => {
  try {
    const stores = await findAllStores()
    res.json(stores)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get store by ID
// @route   GET /api/stores/get-id/:id
const getStoreById = async (req, res) => {
  try {
    const store = await findStoreById(parseInt(req.params.id))
    if (store) {
      res.json(store)
    } else {
      res.status(404).json({ message: 'Store not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get store by ID
// @route   GET /api/stores/get-name/:name
const getStoreByName = async (req, res) => {
  try {
    const store = await findStoreByName(req.params.name)
    if (store) {
      res.json(store)
    } else {
      res.status(404).json({ message: 'Store not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const getStoresByAd = async (req, res) => {
  try {
    const { ad_id } = req.params
    const stores = await findStoresByAd(ad_id)
    if (stores.length > 0) {
      res.json(stores)
    } else {
      res.status(404).json({ message: `No store play this ad` })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get store by state
// @route   GET /api/stores/state/:state
const getStoresByState = async (req, res) => {
  try {
    const stores = await findStoresByState(req.params.state)
    if (stores.length > 0) {
      res.json(stores)
    } else {
      res.status(404).json({ message: `No store exists in ${req.params.state}` })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get store by banner
// @route   GET /api/stores/get-state/:
const getStoresByBanner = async (req, res) => {
  try {
    const stores = await findStoresByBanner(req.params.banner)
    if (stores.length > 0) {
      res.json(stores)
    } else {
      res.status(404).json({ message: `No ${req.params.banner} stores exist` })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getStores,
  getStoreById,
  getStoreByName,
  getStoresByAd,
  getStoresByState,
  getStoresByBanner,
}
