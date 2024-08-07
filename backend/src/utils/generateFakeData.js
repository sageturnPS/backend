const { faker } = require('@faker-js/faker')

// Function to create a fake ad entry
function generateFakeAd(status) {
  const ad = {
    title: faker.lorem.sentence(),
    dateCreated: faker.date.recent().toISOString(),
    image: faker.image.url(),
    status: '',
  }
  ad.status = status || 'unscheduled'

  return ad
}

// function generateFakePlaylist(store_id) {
//   const playlist = {
//     id: faker.string.uuid(),
//     date: faker.date.recent().toISOString(),
//     store_id: store_id || faker.string.uuid(),
//   }

//   return playlist
// }

function generateFakeProduct(category) {
  const product = {
    id: faker.string.uuid(),
    name: faker.commerce.product(),
    category: category || 'none',
  }
  return product
}

function generateFakeStore(name) {
  const store = {
    id: faker.string.uuid(),
    name: name || faker.location.city(),
    address: faker.location.streetAddress(),
    state: faker.location.state({ abbreviated: true }),
  }

  return store
}

function generateFakeUser(first_name, last_name) {
  const user = {
    id: faker.string.uuid(),
    first_name: first_name || faker.person.firstName(),
    last_name: last_name || faker.person.lastName(),
    role: 'Brand Manager',
    is_auth: '1',
    profile_photo: faker.image.avatar(),
    username: '',
    password: faker.internet.password(),
  }
  user.username = faker.internet.userName({
    firstname: user.first_name,
    lastName: user.last_name,
  })
  return user
}

module.exports = {
  generateFakeAd,
  generateFakeProduct,
  generateFakeStore,
  generateFakeUser,
}
