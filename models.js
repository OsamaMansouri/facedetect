const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  userId: {
    type: Number,
  },
  screenshotPath: {
    type: String,
  },
  firstName: {
    type: String,
    default: null, // Set default value to null
  },
  lastName: {
    type: String,
    default: null, // Set default value to null
  },
  email: {
    type: String,
    default: null, // Set default value to null
  },
  sexe: {
    type: String,
    default: null, // Set default value to null
  },
  cartoonImageURL: String,
  backgroundOutput: String,
});

module.exports = mongoose.model("Screenshot", screenshotSchema);
