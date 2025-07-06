const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  ip: String,
  name: String,
  ping: Number,
  download: Number,
  upload: Number,
  location: String,     // optional
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Result', resultSchema);
