require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedSuperAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const email = 'ybvyas786@gmail.com';
    const password = 'Ybvyas786';

    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({
        name: 'System Super Admin',
        email,
        mobile: '9999999999', // Mock mobile
        password,
        role: 'super_admin'
        // district and ward can remain null since super admin oversees everything
      });
      console.log(`✅ Created Super Admin user (${email} / ${password})`);
    } else {
      console.log(`Super Admin ${email} already exists. Updating password and role to ensure access.`);
      exists.password = password;
      exists.role = 'super_admin';
      await exists.save();
      console.log(`✅ Updated Super Admin user (${email} / ${password})`);
    }

    console.log('\nSeeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
