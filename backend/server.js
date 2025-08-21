const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');            // ADD
const jwt = require('jsonwebtoken');                      // ADD
const bcrypt = require('bcryptjs');                       // ADD
require('dotenv').config();

const app = express();

// Trust proxy so Secure cookies work on Railway
app.set('trust proxy', 1); // Railway / proxies

// Configure CORS once, with credentialed origins
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://700-digital-equity.digital',
  'https://speedtest-test-production.up.railway.app',
  'https://speedtest-webapp-production.up.railway.app',
  'https://nzspeedtest.up.railway.app'

]

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // cors middleware already set ACAO/ACAC
    return res.sendStatus(204);
  }
  next();
});
app.use(cookieParser());                                  // ensure before routes
app.use(express.json());

// Session helpers
const COOKIE_NAME = 'sid';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function setSession(res, payload) {
  const crossSite = 'true';
  const sameSite = 'none'; 
  const secure = crossSite || process.env.NODE_ENV === 'production';
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite,
    secure,
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function authRequired(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

// Verify school code (placeholder; implement lookup + bcrypt compare)
async function verifySchoolCode(plain) {
  // Find all active schools
  const schools = await SchoolModel.find({ active: true });
  for (const school of schools) {
    if (school.codeHash && await bcrypt.compare(plain, school.codeHash)) {
      return school;
    }
  }
  return null;
}

// Mount routes
const resultRoutes = require('./routes/results');

// Pass authRequired as an option to the router
app.use('/api/results', (req, res, next) => {
  req.authRequired = authRequired;
  next();
}, resultRoutes);

app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Example: server-side sorted results (non-auth)
const Result = require('./models/Result');
const UserModel = require('./models/User');
const SchoolModel = require('./models/School');
app.get('/results', async (req, res) => {
  try {
    const sortKey = req.query.sortKey || 'download';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const results = await Result.find()
      .sort({ [sortKey]: sortOrder });
    const total = results.length;
    res.json({ results, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Auth endpoints
app.post('/api/auth/code', async (req, res) => {
  const { name, code } = req.body || {};
  if (!name || !code) return res.status(400).json({ error: 'name_and_code_required' });

  const school = await verifySchoolCode(code);
  if (!school) return res.status(401).json({ error: 'invalid_or_expired_code' });

  const user = await UserModel.create({ name, schoolId: school._id });
  if (school.maxUses > 0) {
    await SchoolModel.updateOne({ _id: school._id }, { $inc: { used: 1 } });
  }
  setSession(res, { uid: user._id.toString(), sid: school._id.toString() });
  res.json({ user: { id: user._id, name: user.name, schoolId: school._id, schoolName: school.name } });
});

app.post('/api/auth/guest', async (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name_required' });
  const user = await UserModel.create({ name, schoolId: null });
  setSession(res, { uid: user._id.toString(), sid: null });
  res.json({ user: { id: user._id, name: user.name, schoolId: null } });
});

app.get('/api/me', async (req, res) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return res.json({ user: null });
  try {
    const { uid, sid } = jwt.verify(token, JWT_SECRET);

    // Load user name and school name
    const userDoc = await UserModel.findById(uid).lean();
    let schoolName = null;
    if (sid) {
      const school = await SchoolModel.findById(sid).lean();
      schoolName = school?.name ?? null;
    }

    return res.json({
      user: {
        id: uid,
        name: userDoc?.name ?? null,
        schoolId: sid ?? null,
        schoolName
      }
    });
  } catch {
    return res.json({ user: null });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const sameSite = process.env.CROSS_SITE === 'true' ? 'none' : 'lax';
  const secure = sameSite === 'none' || process.env.NODE_ENV === 'production';
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite, secure, path: '/' });
  res.json({ ok: true });
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

// If you want auth on result creation, enforce it inside the router instead
// Remove duplicate app.post('/api/results', ...) to avoid conflicts

app.post('/api/results', authRequired, async (req, res) => {
  // req.user should have uid and sid (schoolId)
  const { uid, sid } = req.user;
  const { ...resultData } = req.body;

  // Save the result with user and school info
  const result = await ResultModel.create({
    ...resultData,
    userId: uid,
    schoolId: sid || null,
  });

  res.status(201).json({ ok: true, result });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch(err => console.error(err));
