const mongoose = require("mongoose");

// create a new mongoose schema
const Schema = mongoose.Schema;

const diseaseSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  images: [String],
  description: {
    type: String,
    required: true,
    unique: true,
  },
  symptoms: [String],
  treatment: [String],
});

// create a model object
const Disease = mongoose.model("Diseases", diseaseSchema);

module.exports = Disease;
