const express = require('express')
const router = express.Router()
const {
  generateFakeAd,
  generateFakeUser,
} = require('../utils/generateFakeData')

const { insertAdHandler } = require('../controllers/adController')
const { insertUser } = require('../controllers/userController')

router.put('/fake-ad', (_, res) => {
  const fakeAd = generateFakeAd()
  insertAdHandler(fakeAd)
  res.json(fakeAd)
})

router.post('/fake-ads/:n', (req, res) => {
  const response = {
    ads: [],
  }
  const n = parseInt(req.params.n, 10)
  for (let i = 0; i < n; i++) {
    const fakeAd = generateFakeAd()
    response.ads.push(fakeAd)
    insertAdHandler(fakeAd)
  }
  res.json(response.ads)
})

router.post('/fake-user', (_, res) => {
  res.json(generateFakeUser())
})

router.post('/fake-users/:n', (req, res) => {
  const response = {
    users: [],
  }
  const n = parseInt(req.params.n, 10)
  for (let i = 0; i < n; i++) {
    const fakeUser = generateFakeUser()
    response.ads.push(fakeUser)
    insertAdHandler(fakeUser)
  }
  res.json(response.fakeUser)
})

module.exports = router
