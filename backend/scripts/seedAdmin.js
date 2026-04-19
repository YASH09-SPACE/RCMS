require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const District = require('../models/District');
const Ward = require('../models/Ward');

const seedAdminAndConstructors = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Find Ahmedabad District and Daryapur Ward
    const district = await District.findOne({ code: 'AHM' });
    if (!district) throw new Error('Ahmedabad district not found. Have you seeded the DB?');

    const ward = await Ward.findOne({ district: district._id, wardName: 'Daryapur' });
    if (!ward) throw new Error('Daryapur ward not found.');

    const password = '123456';

    // 2. Create Admin
    const adminExists = await User.findOne({ email: 'admin@rcms.com' });
    if (!adminExists) {
      await User.create({
        name: 'Daryapur Ward Admin',
        email: 'admin@rcms.com',
        mobile: '9999900001',
        password,
        role: 'admin',
        district: district._id,
        ward: ward._id
      });
      console.log('✅ Created Admin user (admin@rcms.com / 123456)');
    } else {
      console.log('Admin already exists.');
    }

    // 3. Create 3 Constructors
    for (let i = 1; i <= 3; i++) {
      const email = `constructor${i}@rcms.com`;
      const exists = await User.findOne({ email });
      if (!exists) {
        await User.create({
          name: `Worker Bhai ${i}`,
          email,
          mobile: `888880000${i}`,
          password,
          role: 'constructor',
          district: district._id,
          ward: ward._id
        });
        console.log(`✅ Created Constructor ${i} (${email} / 123456)`);
      } else {
        console.log(`Constructor ${i} already exists.`);
      }
    }

    console.log('\nSeeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedAdminAndConstructors();
