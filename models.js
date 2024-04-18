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
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  sexe: {
    type: String,
  },
  cartoonImageURL: String,
  backgroundOutput: String,
});

module.exports = mongoose.model("Screenshot", screenshotSchema);
