const mongoose = require('mongoose');
const { Schema } = mongoose;

const SchoolSchema = new Schema({
  name: { type: String, required: true },
  codeHash: String,
  expiresAt: Date,
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  used: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
