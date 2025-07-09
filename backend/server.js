const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const resultRoutes = require('./routes/results');
const TestResult = require('./models/TestResult');
const Result = require('./models/Result');
app.use('/api/results', resultRoutes);


app.get('/', (req, res) => {
  res.send('Backend API is running');
});

app.get('/results', async (req, res) => {
  try {
    const results = await Result.find().sort({ timestamp: -1 }).limit(10);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.post('/upload', (req, res) => {
  req.on('data', () => {}); // Discard incoming data
  req.on('end', () => res.status(200).send('OK'));
});



mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server running on port 3000');
    });
  })
  .catch(err => console.error(err));
