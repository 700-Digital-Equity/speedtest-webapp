const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const School = require('../models/School'); // Import the School model

// Use req.authRequired as middleware
router.post('/', function(req, res, next) {
  req.authRequired(req, res, next);
}, async (req, res) => {
  try {
    const { uid, sid } = req.user;
    const resultData = req.body;

    // Fetch the location from the School model if sid is provided
    let location = null;
    if (sid) {
      const school = await School.findById(sid).lean();
      location = school?.location || null;
    }

    const result = await Result.create({
      ...resultData,
      userId: uid,
      schoolId: sid || null,
      location, // Add the location field
    });

    res.status(201).json({ ok: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get top results (leaderboard)
router.get('/leaderboard', async (req, res) => {
  const top = await Result.find().sort({ download: -1 }).limit(10);
  res.json(top);
});

// Get results by IP
router.get('/:ip', async (req, res) => {
  const results = await Result.find({ ip: req.params.ip }).sort({ timestamp: -1 });
  res.json(results);
});

module.exports = router;
