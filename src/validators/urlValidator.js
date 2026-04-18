const Joi = require("joi");

// Define schema for URL creation
const createUrlSchema = Joi.object({
  url: Joi.string().uri().required(), // must be valid URL
  customAlias: Joi.string().alphanum().min(3).max(20).optional(),
  expiresIn: Joi.number().integer().min(1).max(10080).optional(), // max = 7 days (in minutes)
});

module.exports = {
  createUrlSchema,
};