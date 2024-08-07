const {
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  getAdDates,
  findAdsByStore,
  findAdsByBanner,
  findAdsByProduct,
  findAdsByStatus,
  findAdsByDate,
  assignAdToPlaylist,
  assignAdDates,
  removeAdDates,
  findAdsByPlaylist,
} = require('../models/adModel')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs')

// ? Helper Functions ? //

// Clears /uploads after usage //
const clearUploadsDir = () => {
  const uploadDir = path.join(__dirname, '../uploads')

  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error('Error reading upload directory:', err)
      return
    }

    files.forEach((file) => {
      const filePath = path.join(uploadDir, file)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err)
        } else {
          console.log(`Deleted file: ${filePath}`)
        }
      })
    })
  })
}

// Ensure uploads directory exists
const ensureUploadsDirExists = () => {
  const uploadDir = path.join(__dirname, '../uploads')
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
}

// ? END Helper Funcitons ? //

const getAllAdsHandler = async (req, res) => {
  try {
    const ads = await getAllAds()

    res.json(ads)
  } catch (error) {
    console.error('Error in getAds:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAdByIdHandler = async (req, res) => {
  try {
    const ad = await getAdById(parseInt(req.params.id))
    if (ad) {
      res.json(ad)
    } else {
      res.status(404).json({ message: 'Ad not found' })
    }
  } catch (error) {
    console.error('Error in getAdById:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const createAdHandler = (req, res) => {
  // const {title, image, ad_status, product_ids } = req
  ensureUploadsDirExists() // Ensure the uploads directory exists
  const form = new formidable.IncomingForm({
    keepExtensions: true,
    uploadDir: '../uploads',
    filter: function ({ name, originalFilename, mimetype }) {
      return mimetype && mimetype.includes('image')
    },
  })
  // ? Uploads files to the /uploads directory
  form.uploadDir = path.join(__dirname, '../uploads')

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err)
      return res.status(400).send('Error parsing the form data')
    }
    // ? Setting variables using Formidable
    const title = fields.title
    const imageData = fs.readFileSync(files.image[0].filepath) || null
    const product_ids = fields.product_ids

    // ? END Image File parsing ? //

    console.log('')
    // * Createad will upload imagePath to the S3 Bucket and update the ad accordingly * //
    try {
      const newAd = await createAd({
        title: title,
        date_created: new Date(),
        image: imageData,
        ad_status: 'scheduled',
        product_ids: product_ids ? JSON.parse(product_ids) : [], // Parse product_ids from string to array
      })
      res.status(201).json(newAd)
    } catch (error) {
      console.error('Error in createNewAd:', error)
      res.status(500).json({ message: 'Server error when creating Ad' }, error)
    }
    clearUploadsDir()
  })
}

const updateAdHandler = (req, res) => {
  ensureUploadsDirExists() // Ensure the uploads directory exists

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    filter: function ({ name, originalFilename, mimetype }) {
      return mimetype && mimetype.includes('image')
    },
  })
  form.uploadDir = path.join(__dirname, '../uploads')

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err)
      return res.status(400).send('Error parsing the form data')
    }

    const adId = req.params.id
    const { title, ad_status, product_ids } = fields
    let image = undefined

    if (files.image) {
      const oldPath = files.file.filepath
      console.log(oldPath)
      const ext = path.extname(files.file.originalFilename)
      console.log(ext)
      const newFilename = `${files.file.newFilename}${ext}`
      console.log(newFilename)
      const newPath = path.join(form.uploadDir, newFilename)
      fs.renameSync(oldPath, newPath)
      image = newPath
    }

    const updateData = {
      ...(title && { title }),
      ...(image && { image }),
      ...(ad_status && { ad_status }),
    }

    if (product_ids !== undefined) {
      updateData.product_ids = JSON.parse(product_ids)
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' })
    }

    try {
      await updateAd(adId, updateData)
      res.json({ isUpdated: true })
    } catch (error) {
      console.error('Error in updateAdHandler:', error)
      if (error.message.includes('not found')) {
        res.status(404).json({ message: `Ad with ID ${adId} not found.` })
      } else {
        res.status(500).json({ message: 'Server error' })
      }
    }
  })
}

const deleteAdHandler = async (req, res) => {
  const adId = req.params.id

  try {
    const deleted = await deleteAd(adId)
    if (deleted) {
      res.json({ message: `Ad with ID ${adId} deleted successfully.` })
    } else {
      res.status(404).json({ message: `Ad with ID ${adId} not found.` })
    }
  } catch (error) {
    console.error('Error in deleteAdHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const getAdDatesHandler = async (req, res) => {
  const { id } = req.params

  try {
    const dates = await getAdDates(id)
    res.json(dates)
  } catch (error) {
    console.error('Error in getAdDatesHandler:', error)
    res.status(500).json({ message: 'Server error', error })
  }
}

const findAdsByStoreHandler = async (req, res) => {
  const { store_id } = req.params

  try {
    const ads = await findAdsByStore(store_id)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByStoreHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const findAdsByBannerHandler = async (req, res) => {
  const { banner } = req.params

  try {
    const ads = await findAdsByBanner(banner)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByBannerHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const findAdsByProductHandler = async (req, res) => {
  const { product_id } = req.params

  try {
    const ads = await findAdsByProduct(product_id)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByProductHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const findAdsByStatusHandler = async (req, res) => {
  const { ad_status } = req.params

  try {
    const ads = await findAdsByStatus(ad_status)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByProductHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const findAdsByDateHandler = async (req, res) => {
  const { date } = req.params

  try {
    const ads = await findAdsByDate(date)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByDateHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const assignAdToPlaylistHandler = async (req, res) => {
  const { ad_id, playlist_id } = req.params

  try {
    const isAssigned = await assignAdToPlaylist({
      ad_id,
      playlist_id,
    })
    res.status(200).json({ isAssigned })
    return true
  } catch (error) {
    console.error('Error in assignAdToPlaylistHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const assignAdDatesHandler = async (req, res) => {
  const { ad_id } = req.params
  const { start_date, end_date, store_ids } = req.body
  try {
    const queryData = {
      ad_id,
      start_date,
      end_date,
    }

    if (store_ids) {
      queryData.store_ids = store_ids
    }

    const isAssigned = await assignAdDates(queryData)
    res.status(200).json({ isAssigned })
  } catch (error) {
    console.error('Error in assignAdDatesHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const removeAdDatesHandler = async (req, res) => {
  const { ad_id } = req.params
  const { start_date, end_date } = req.body
  try {
    const isRemoved = await removeAdDates({
      ad_id,
      start_date,
      end_date,
    })
    res.status(200).json({ isRemoved })
  } catch (error) {
    console.error('Error in removeAdDatesHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

const findAdsByPlaylistHandler = async (req, res) => {
  const { playlist_id } = req.params

  try {
    const ads = await findAdsByPlaylist(playlist_id)
    res.json(ads)
  } catch (error) {
    console.error('Error in findAdsByPlaylistHandler:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  getAllAdsHandler,
  getAdByIdHandler,
  createAdHandler,
  updateAdHandler,
  deleteAdHandler,
  getAdDatesHandler,
  findAdsByStoreHandler,
  findAdsByBannerHandler,
  findAdsByProductHandler,
  findAdsByStatusHandler,
  findAdsByDateHandler,
  assignAdToPlaylistHandler,
  assignAdDatesHandler,
  removeAdDatesHandler,
  findAdsByPlaylistHandler,
}
