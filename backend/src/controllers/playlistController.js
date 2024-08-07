const {
  getAllPlaylists,
  getStorePlaylists,
  getStorePlaylistByDate,
  getPlaylistById,
  getAdPlaylists,
  createPlaylist,
  deletePlaylist,
  updateOrder
} = require('../models/playlistModel')

// ? GET handlers
const getAllPlaylistsHandler = async (req, res) => {
  try {
    const playlists = await getAllPlaylists()
    res.json(playlists)
  } catch (error) {
    console.error('Server error: ', error)
  }
}

const getStorePlaylistsHandler = async (req, res) => {
  const { store_id } = req.params

  try {
    const playlists = await getStorePlaylists(store_id)
    res.json(playlists)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const getStorePlaylistByDateHandler = async (req, res) => {
  const { date, store_id } = req.params
  try {
    const playlist = await getStorePlaylistByDate({ date, store_id })
    if (playlist) {
      res.json(playlist)
    } else {
      res.status(404).json({ message: 'Playlist not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const getPlaylistByIdHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await getPlaylistById(id)
    res.json(playlist)
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const getAdPlaylistsHandler = async (req, res) => {
  const { ad_id } = req.params;
  console.log(ad_id)
  try {
    const playlists = await getAdPlaylists(ad_id)
    res.json(playlists)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ? POST handler
const createPlaylistHandler = async (req, res) => {
  const { date, store_id } = req.body

  try {
    const newPlaylist = await createPlaylist({
      date,
      store_id,
    })
    res.status(201).json(newPlaylist)
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ? DELETE handler
const deletePlaylistHandler = async (req, res) => {
  try {
    const deletedAd = await deletePlaylist(parseInt(req.params.id))
    if (deletedAd) {
      res.json({ message: 'Playlist deleted' })
    } else {
      res.status(404).json({ message: 'Playlist not found' })
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

const updateOrderInPlaylistHandler = async (req, res) => {
  const { playlist_id, ad_id, position } = req.params;
  try {
    const newPosition = parseInt(position, 10);

    const result = await updateAdOrder(playlist_id, ad_id, newPosition);

    if (result) {
      res.status(200).json({ message: 'Ad order updated successfully' });
    } else {
      res.status(404).json({ message: 'Ad not found in the playlist or failed to update' });
    }
    return true
  } catch (error) {
    console.error('Error updating ad order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getAllPlaylistsHandler,
  getStorePlaylistsHandler,
  getStorePlaylistByDateHandler,
  getPlaylistByIdHandler,
  getAdPlaylistsHandler,
  createPlaylistHandler,
  deletePlaylistHandler,
  updateOrderInPlaylistHandler
}
