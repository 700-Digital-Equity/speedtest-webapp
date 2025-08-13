const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const School = require('../models/School'); // Use your existing model
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI ;

async function insertSchool() {
  await mongoose.connect(MONGO_URI);

  const code = 'uoa123';
  const codeHash = await bcrypt.hash(code, 10);

  const school = await School.create({
    name: 'University of Auckland',
    codeHash,
    active: true,
  });

  console.log('Inserted school:', school);
  await mongoose.disconnect();
}

insertSchool().catch(err => {
  console.error(err);
  process.exit(1);
});