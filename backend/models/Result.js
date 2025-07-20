const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  ip: String,
  name: String,
  ping: Number,
  download: Number,
  upload: Number,
  location: String,
  timestamp: { type: Date, default: Date.now },
  deviceType: String,             
  connectionType: String,       
  notes: String           
});

module.exports = mongoose.model('Result', resultSchema);
