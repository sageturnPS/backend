const pool = require('../config/db');

const findAllStores = async () => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM Store');
    return rows;
  } catch (error) {
    throw error;
  }
};


const findStoreById = async (id) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM Store WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

const findStoreByName = async (name) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM Store WHERE name = ?', [name]);
    return rows[0];
  } catch (error) {
    throw error;
  }
}

const findStoresByAd = async (ad_id) => {
  try {
    const [rows, fields] = await pool.query(`
      SELECT DISTINCT S.* FROM Store S
      INNER JOIN Playlist P ON S.id = P.store_id
      INNER JOIN Playlist_Ad PA ON PA.ad_id = ?
      `, [ad_id])
    return rows
  } catch (error) {
    throw (error)
  }
}

const findStoresByState = async (state) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM Store WHERE state = ?', [state]);
    return rows;
  } catch (error) {
    throw error;
  }
}

const findStoresByBanner = async (banner) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM Store WHERE banner = ?', [banner]);
    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  findAllStores,
  findStoreById,
  findStoreByName,
  findStoresByAd,
  findStoresByState,
  findStoresByBanner,
}
