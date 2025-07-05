const express = require('express');
const router = express.Router();
const Result = require('../models/Result');

// Save a speed test result
router.post('/', async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
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
