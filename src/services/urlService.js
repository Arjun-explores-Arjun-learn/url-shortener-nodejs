const shortid = require("shortid");
const URL = require("../models/url");

async function createShortUrl({ originalUrl, userId, customAlias, expiresIn }) {
  const redirectURL =
    originalUrl.startsWith("http://") ||
    originalUrl.startsWith("https://")
      ? originalUrl
      : `https://${originalUrl}`;

  let shortID;

  // Custom alias logic
  if (customAlias && customAlias.trim() !== "") {
    shortID = customAlias.trim().toLowerCase();

    const existing = await URL.findOne({ shortId: shortID });
    if (existing) {
      throw new Error("Custom alias already taken");
    }
  } else {
    shortID = shortid();
  }

  // Expiry calculation
  let expiresAt = null;

  if (expiresIn) {
    const minutes = parseInt(expiresIn); // Converts expiresIn (usually a string) into an integer

    if (!isNaN(minutes)) { // if user passed "abc"
      expiresAt = new Date(Date.now() + minutes * 60 * 1000);
    }
  }

  const newEntry = await URL.create({
    shortId: shortID,
    redirectURL,
    visitHistory: [],
    createdBy: userId,
    expiresAt,
  });

  return newEntry;
}

module.exports = {
  createShortUrl,
};