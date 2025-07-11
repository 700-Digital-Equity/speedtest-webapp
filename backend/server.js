const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const resultRoutes = require('./routes/results');
const TestResult = require('./models/TestResult');
const Result = require('./models/Result');
app.use('/api/results', resultRoutes);


app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.get('/results', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;
    const sortKey = req.query.sortKey || 'download';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const total = await Result.countDocuments();
    const results = await Result.find()
      .sort({ [sortKey]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    res.json({ results, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch(err => console.error(err));
