const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: false },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);