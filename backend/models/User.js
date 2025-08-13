import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const School = new Schema({
  name: String,
  codeHash: String,           // store a hash of the code, not plaintext
  expiresAt: Date,
  maxUses: { type: Number, default: 0 }, // 0 = unlimited
  used: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

const User = new Schema({
  name: { type: String, required: true },
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
}, { timestamps: true });

export const SchoolModel = model('School', School);
export const UserModel = model('User', User);