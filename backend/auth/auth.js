import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel, SchoolModel } from '../models/models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const COOKIE_NAME = 'sid';

export function setSession(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

export async function verifySchoolCode(plain) {
  // Query the database for active schools
  const schools = await SchoolModel.find({ active: true });

  // Iterate over the schools and compare the hashed code
  for (const school of schools) {
    if (school.codeHash && await bcrypt.compare(plain, school.codeHash)) {
      return school; // Return the matching school
    }
  }

  // If no match is found, return null
  return null;
}