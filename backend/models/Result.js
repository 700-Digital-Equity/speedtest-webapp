const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  ip: String,
  name: String,
  ping: Number,
  download: Number,
  upload: Number,
  jitter: Number,
  packetLoss: Number,
  geo: Object,              
  isp: String,
  os: String,
  deviceModel: String,             
  connectionType: String,       
  notes: String,    
  timestamp: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', default: null },
  location: String
});

module.exports = mongoose.model('Result', resultSchema);
