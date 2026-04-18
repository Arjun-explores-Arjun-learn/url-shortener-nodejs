// Controller handles request & response ONLY
// validate input-->call service-->send response


const urlService = require("../services/urlService");
const { createUrlSchema } = require("../validators/urlValidator");

async function handleGenerateNewShortURL(req, res) {
  try {
    //VALIDATION STEP
    const { error, value } = createUrlSchema.validate(req.body);

    if (error) {
      // return first validation error message
      return res.status(400).send(error.details[0].message);
    }

    const { url, customAlias, expiresIn } = value;

    const newUrl = await urlService.createShortUrl({
      originalUrl: url.trim(),
      userId: req.user._id,
      customAlias,
      expiresIn,
    });

    return res.render("home", {
      id: newUrl.shortId,
      user: req.user, 
    });

  } catch (err) {
    if (err.message === "Custom alias already taken") {
      return res.status(400).send("Alias already in use.");
    }

    console.error(err);
    return res.status(500).send("Server Error");
  }
}

const URL = require("../models/url"); 
async function handleGetAnalytics(req, res) {
  try {
    const shortId = req.params.shortId;

    const result = await URL.findOne({ shortId });

    if (!result) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Server Error");
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};