const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  ping: Number,
  download: Number,
  upload: Number,
  user: { type: String, default: 'Anonymous' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TestResult', testResultSchema);