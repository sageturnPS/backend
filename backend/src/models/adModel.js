const pool = require('../config/db')
const { uploadAdToS3 } = require('../utils/uploadImageAWS')
const fs = require('fs')
const path = require('path')

// ? Helper functions ? //
function isValidURL(str) {
  try {
    new URL(str)
    return true
  } catch (e) {
    return false
  }
}

function cleanLink(url) {
  // Define a regular expression to match image extensions
  console.log(url)
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp)(?=\W|$)/i

  // Use the exec method to find the match and get the index
  const match = imageExtensions.exec(url)
  if (match) {
    const extensionIndex = match.index + match[0].length
    // Return the URL truncated at the end of the image extension
    return url.substring(0, extensionIndex)
  }

  // If no image extension is found, return the URL as-is
  return url
}

function cleanAdArray(objs) {
  objs.map((item) => {
    const newItem = {
      ...item,
      image: cleanLink(item.image),
    }
    console.log(newItem)
    return newItem
  })
  console.log(objs)
  return objs
}

const clearBadLinks = async () => {
  try {
    // Fetch all rows from the 'Ad' table
    const [rows] = await pool.execute('SELECT * FROM Ad')

    // Transform the data

    // Update the database with the transformed data
    // console.log(updatedRows)
    for (const row of rows) {
      row.image = cleanLink(row.image)
      const { id, image } = row
      console.log(id, image)
      await pool.query('UPDATE Ad SET image = ? WHERE id = ?', [image, id])
    }

    console.log('Database updated successfully')
  } catch (err) {
    console.error('Error updating database:', err)
  } finally {
    await pool.end()
  }
}

// ? END Helper Functions ? //

const getAllAds = async () => {
  try {
    const [rows, fields] = await pool.query(`
      SELECT A.*, JSON_ARRAYAGG(AP.product_id) AS product_ids FROM Ad A
      LEFT JOIN Ad_Product AP ON A.id = AP.ad_id
      GROUP BY A.id
      `)
    return rows
  } catch (error) {
    console.error('Error in findAllAds:', error)
    throw error
  }
}

const getAdById = async (id) => {
  try {
    const query = `
      SELECT A.*, JSON_ARRAYAGG(AP.product_id) AS product_ids
      FROM Ad A
      LEFT JOIN Ad_Product AP ON A.id = AP.ad_id
      WHERE A.id = ?
      GROUP BY A.id
    `
    const [rows, fields] = await pool.query(query, [id])
    return rows[0]
  } catch (error) {
    throw error
  }
}

const createAd = async (adData) => {
  const { title, date_created, image, ad_status, product_ids } = adData
  console.log(adData)

  try {
    const query = `
      INSERT INTO Ad (title, date_created, image, ad_status)
      VALUES (?, ?, ?, ?)
    `
    const [result] = await pool.query(query, [
      title,
      date_created,
      'placeholder',
      ad_status,
    ])

    const newAd = {
      id: result.insertId,
      title,
      date_created,
      image,
      ad_status,
      product_ids, // Optionally include product_ids in the newAd object
    }

    if (image) {
      const uploadedImageUrl = await cleanLink(
        uploadAdToS3(image, result.insertId)
      )
      newAd.image = uploadedImageUrl
      console.log(uploadedImageUrl)

      // ? Update the ad record with the actual image URL
      await pool.query(`UPDATE Ad SET image = ? WHERE id = ?`, [
        uploadedImageUrl,
        result.insertId,
      ])
    }

    // Inserting into Ad_Product for each product_id
    if (product_ids && product_ids.length > 0) {
      const insertPromises = product_ids.map(async (product_id) => {
        await pool.query(
          `
          INSERT INTO Ad_Product (ad_id, product_id)
          VALUES (?, ?)
        `,
          [result.insertId, product_id]
        )
      })
      await Promise.all(insertPromises)
    }

    return newAd
  } catch (error) {
    console.error('Error in createAd:', error)
    throw error
  }
}

const updateAd = async (ad_id, updatedAdData) => {
  const { title, image, ad_status, product_ids } = updatedAdData

  try {
    let query = 'UPDATE Ad SET '
    const params = []
    const fieldsToUpdate = []

    if (title !== undefined) {
      fieldsToUpdate.push('title = ?')
      params.push(title)
    }
    if (image !== undefined) {
      fieldsToUpdate.push('image = ?')
      params.push(image)
    }
    if (ad_status !== undefined) {
      fieldsToUpdate.push('ad_status = ?')
      params.push(ad_status)
    }

    if (fieldsToUpdate.length > 0) {
      query += fieldsToUpdate.join(', ') + ' WHERE id = ?'
      params.push(ad_id)

      const [result] = await pool.query(query, params)

      if (result.affectedRows <= 0) {
        throw new Error(`Ad with ID ${ad_id} not found or no fields updated.`)
      }

      if (image !== undefined && !isValidURL(image)) {
        const fileContent = await fs.promises.readFile(image)
        await uploadAdToS3(fileContent, ad_id)
      }
    }

    if (product_ids !== undefined && Array.isArray(product_ids)) {
      await pool.query('DELETE FROM Ad_Product WHERE ad_id = ?', [ad_id])

      const insertPromises = product_ids.map(async (product_id) => {
        await pool.query(
          `
          INSERT INTO Ad_Product (ad_id, product_id)
          VALUES (?, ?)
        `,
          [ad_id, product_id]
        )
      })
      await Promise.all(insertPromises)
    }
  } catch (error) {
    console.error('Error in updateAd:', error)
    throw error
  }
}

const deleteAd = async (ad_id) => {
  try {
    // Begin a transaction for atomicity
    const connection = await pool.getConnection()
    await connection.beginTransaction()

    try {
      // Delete from Ad_Product table
      const deleteAdProductQuery = `
        DELETE FROM Ad_Product
        WHERE ad_id = ?
      `
      await connection.query(deleteAdProductQuery, [ad_id])

      // Delete from Ad table
      const deleteAdQuery = `
        DELETE FROM Ad
        WHERE id = ?
      `
      const [adResult] = await connection.query(deleteAdQuery, [ad_id])

      if (adResult.affectedRows === 0) {
        throw new Error(`Ad with ID ${ad_id} not found.`)
      }

      // Commit the transaction if all queries succeed
      await connection.commit()

      return true
    } catch (error) {
      // Rollback transaction if any query fails
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error('Error in deleteAd:', error)
    throw error
  }
}

const getAdDates = async (id) => {
  try {
    const [rows, fields] = await pool.query(
      `
      SELECT MIN(date) AS start_date, MAX(date) AS end_date FROM Playlist P
      INNER JOIN Playlist_Ad PA ON P.id = PA.playlist_id
      WHERE PA.ad_id = ?
      `,
      [id]
    )
    return rows[0]
  } catch (error) {
    throw error
  }
}

const findAdsByStore = async (store_id) => {
  try {
    const [rows, fields] = await pool.query(
      `
      SELECT DISTINCT A.* FROM Ad A
      INNER JOIN Playlist_Ad PA ON A.id = PA.ad_id
      INNER JOIN Playlist P ON PA.playlist_id = P.id
      WHERE P.store_id = ?
      `,
      [store_id]
    )
    return rows
  } catch (error) {
    throw error
  }
}

const findAdsByBanner = async (banner) => {
  try {
    const [rows, fields] = await pool.query(
      `
      SELECT DISTINCT A.* FROM Ad A INNER JOIN Playlist_Ad PA ON A.id = PA.ad_id
      INNER JOIN Playlist P ON PA.playlist_id = P.id
      INNER JOIN Store S ON P.store_id = S.id
      WHERE S.banner = ?
      `,
      [banner]
    )
    return rows
  } catch (error) {
    throw error
  }
}

const findAdsByProduct = async (product_id) => {
  try {
    const [rows, fields] = await pool.query(
      'SELECT A.* FROM Ad A INNER JOIN Ad_Product AP ON A.id = AP.ad_id WHERE AP.product_id = ?',
      [product_id]
    )
    return rows
  } catch (error) {
    console.error('Error in findAdsByProduct:', error)
    throw error
  }
}

const findAdsByStatus = async (ad_status) => {
  try {
    const [rows, fields] = await pool.query(
      'SELECT * FROM Ad A WHERE A.ad_status = ?',
      [ad_status]
    )
    return rows
  } catch (error) {
    console.error('Error in findAdsByStatus:', error)
    throw error
  }
}

const findAdsByDate = async (date) => {
  try {
    const [rows, fields] = await pool.query(
      `
      SELECT DISTINCT A.* FROM Ad A
      INNER JOIN Playlist_Ad PA ON A.id = PA.ad_id
      INNER JOIN Playlist P
      WHERE P.date = ?`,
      [date]
    )
    return rows
  } catch (error) {
    console.error('Error in findAdsByDate:', error)
    throw error
  }
}

const assignAdToPlaylist = async ({ ad_id, playlist_id }) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO Playlist_Ad (playlist_id, ad_id) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE playlist_id = ?`,
      [playlist_id, ad_id, playlist_id]
    )
    return result.affectedRows > 0
  } catch (error) {
    console.error('Error in assignAdToPlaylist:', error)
    throw error
  }
}

const assignAdDates = async ({ ad_id, start_date, end_date, store_ids }) => {
  try {
    // 1. Get stores
    let storeIds = []
    if (store_ids) {
      storeIds = store_ids
    } else {
      const [stores] = await pool.query(
        `
      SELECT DISTINCT S.* FROM Store S
      INNER JOIN Playlist P ON S.id = P.store_id
      INNER JOIN Playlist_Ad PA ON PA.ad_id = ?
      `,
        [ad_id]
      )
      storeIds = stores.map((store) => store.id)
    }

    const [playlists] = await pool.query(
      `SELECT P.* FROM Playlist P WHERE store_id IN (?)
      AND date BETWEEN CAST(? AS DATE) AND CAST(? AS DATE)`,
      [storeIds, start_date, end_date]
    )

    // 2. Insert ad into all playlists
    if (playlists.length > 0) {
      const values = playlists.map((playlist) => [playlist.id, ad_id])

      const [result] = await pool.query(
        `INSERT INTO Playlist_Ad (playlist_id, ad_id) VALUES ?
        ON DUPLICATE KEY UPDATE ad_id = ?`,
        [values, ad_id]
      )

      return result.affectedRows === playlists.length
    } else {
      throw new Error('Failed to schedule ad')
    }
  } catch (error) {
    throw error
  }
}

const removeAdDates = async ({ ad_id, start_date, end_date }) => {
  try {
    // 1. Get playlists outside of date range
    const [playlists] = await pool.query(
      `SELECT P.* FROM Playlist P 
      INNER JOIN Playlist_Ad PA ON P.id = PA.playlist_id
      WHERE PA.ad_id = ? AND P.date NOT BETWEEN CAST(? AS DATE) AND CAST(? AS DATE)`,
      [ad_id, start_date, end_date]
    )

    // 2. Remove from playlists
    if (playlists.length > 0) {
      const playlist_ids = playlists.map((playlist) => playlist.id)

      const [result] = await pool.query(
        `DELETE FROM Playlist_Ad WHERE ad_id = ? AND playlist_id IN (?)`,
        [ad_id, playlist_ids]
      )

      return result.affectedRows === playlists.length
    } else {
      return false
    }
  } catch (error) {
    throw error
  }
}

const findAdsByPlaylist = async (playlist_id) => {
  try {
    const [rows, fields] = await pool.query(
      'SELECT A.* FROM Ad A INNER JOIN Playlist_Ad PA ON A.id = PA.ad_id WHERE PA.playlist_id = ?',
      [playlist_id]
    )
    return rows
  } catch (error) {
    console.error('Error in findAdsByPlaylist:', error)
    throw error
  }
}

module.exports = {
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
  clearBadLinks,
}
