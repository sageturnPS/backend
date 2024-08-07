let blacklistedTokens = [];

const addToBlacklist = (token) => {
  blacklistedTokens.push(token);
};

const isInBlacklist = (token) => {
  return blacklistedTokens.includes(token);
};

module.exports = {
  addToBlacklist,
  isInBlacklist,
};