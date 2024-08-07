const pool = require('../config/db');

const getAllPlaylists = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM Playlist');
    return rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const getStorePlaylists = async (store_id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Playlist WHERE store_id = ?', [store_id]);
    return rows;
  } catch (error) {
    throw error;
  }
}

// const getStorePlaylistByDate = async ({ date, store_id }) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM Playlist WHERE date = ? AND store_id = ?', [date, store_id]);
//     return rows[0];
//   } catch (error) {
//     throw error;
//   }
// }

const getStorePlaylistByDate = async ({ date, store_id }) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Playlist WHERE date = ? AND store_id = ?', [date, store_id]);
    // Check if rows is empty and return an empty object if true
    return rows.length > 0 ? rows[0] : {};
  } catch (error) {
    // Handle the error
    console.error('Error fetching store playlist:', error);
    throw error; // Re-throw error after logging
  }
}

const getPlaylistById = async (id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Playlist WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error(error)
    throw error;
  }
}

const getAdPlaylists = async ({ ad_id }) => {
  try {
    const [rows, fields] = await pool.query(
      'SELECT P.* FROM Playlist P INNER JOIN Playlist_Ad PA ON P.id = PA.playlist_id WHERE PA.ad_id = ?',
      [ad_id]
    )
    return rows
  } catch (error) {
    throw error
  }
}

const createPlaylist = async ({ date, store_id }) => {
  try {
    const [storeCount] = await pool.query('SELECT COUNT(*) AS count FROM Store WHERE id = ?', [store_id]);
    if (storeCount[0].count > 0) {
      const [result] = await pool.query('INSERT INTO Playlist (date, store_id) VALUES (?, ?)', [date, store_id]);

      const newPlaylist = {
        id: result.insertId,
        date,
        store_id,
      }
      return newPlaylist;
    } else {
      throw new Error("Store not found")
    }
  } catch (error) {
    throw error;
  }
}

const deletePlaylist = async (id) => {
  try {
    const [result] = await pool.query('DELETE FROM Playlist WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
}

const updateOrder = async (playlistId, adId, newPosition) => {
  try {
    // First, check if the ad exists in the playlist
    const [checkResult] = await pool.query('SELECT * FROM Playlist_Ad WHERE playlist_id = ? AND ad_id = ?', [playlistId, adId]);
    
    if (checkResult.length === 0) {
      throw new Error('Ad is not associated with the playlist');
    }

    // Update the position of the ad in the playlist
    const [updateResult] = await pool.query('UPDATE Playlist_Ad SET position = ? WHERE playlist_id = ? AND ad_id = ?', [newPosition, playlistId, adId]);

    if (updateResult.affectedRows > 0) {
      return true; // Updated successfully
    } else {
      throw new Error('Failed to update ad position');
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllPlaylists,
  getStorePlaylists,
  getStorePlaylistByDate,
  getPlaylistById,
  getAdPlaylists,
  createPlaylist,
  deletePlaylist,
  updateOrder
}
