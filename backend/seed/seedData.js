const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Models
const District = require('../models/District');
const Ward = require('../models/Ward');
const ComplaintCategory = require('../models/ComplaintCategory');
const User = require('../models/User');

// ----- SEED DATA -----

const gujaratDistricts = [
  { name: 'Ahmedabad', code: 'AHM' },
  { name: 'Surat', code: 'SUR' },
  { name: 'Vadodara', code: 'VAD' },
  { name: 'Rajkot', code: 'RAJ' },
  { name: 'Bhavnagar', code: 'BHA' },
  { name: 'Jamnagar', code: 'JAM' },
  { name: 'Junagadh', code: 'JUN' },
  { name: 'Gandhinagar', code: 'GAN' },
  { name: 'Anand', code: 'ANA' },
  { name: 'Bharuch', code: 'BHR' },
  { name: 'Mehsana', code: 'MEH' },
  { name: 'Kheda', code: 'KHE' },
  { name: 'Panchmahal', code: 'PAN' },
  { name: 'Sabarkantha', code: 'SAB' },
  { name: 'Banaskantha', code: 'BAN' },
  { name: 'Kutch', code: 'KUT' },
  { name: 'Amreli', code: 'AMR' },
  { name: 'Porbandar', code: 'POR' },
  { name: 'Navsari', code: 'NAV' },
  { name: 'Valsad', code: 'VAL' },
  { name: 'Tapi', code: 'TAP' },
  { name: 'Narmada', code: 'NAR' },
  { name: 'Dang', code: 'DNG' },
  { name: 'Patan', code: 'PAT' },
  { name: 'Surendranagar', code: 'SNR' },
  { name: 'Botad', code: 'BOT' },
  { name: 'Morbi', code: 'MOR' },
  { name: 'Devbhoomi Dwarka', code: 'DEV' },
  { name: 'Gir Somnath', code: 'GIR' },
  { name: 'Mahisagar', code: 'MHS' },
  { name: 'Aravalli', code: 'ARA' },
  { name: 'Chhota Udaipur', code: 'CHU' },
  { name: 'Dahod', code: 'DAH' }
];

const complaintCategories = [
  { name: 'Pothole', icon: 'road', description: 'Road potholes and damage', defaultPriority: 'high', slaHours: 24 },
  { name: 'Street Light', icon: 'lightbulb', description: 'Broken or non-functional street lights', defaultPriority: 'medium', slaHours: 48 },
  { name: 'Drainage', icon: 'water', description: 'Drainage blockage or overflow', defaultPriority: 'high', slaHours: 72 },
  { name: 'Garbage Collection', icon: 'trash', description: 'Irregular garbage collection or dumping', defaultPriority: 'medium', slaHours: 24 },
  { name: 'Water Supply', icon: 'droplet', description: 'Water supply issues', defaultPriority: 'high', slaHours: 48 },
  { name: 'Park Maintenance', icon: 'tree', description: 'Park and garden maintenance', defaultPriority: 'low', slaHours: 168 }
];

// Sample wards for major districts
const sampleWards = {
  'Ahmedabad': [
    { wardNumber: '1', wardName: 'Daryapur', areaNames: ['Daryapur', 'Teen Darwaja', 'Bhadra'] },
    { wardNumber: '2', wardName: 'Kalupur', areaNames: ['Kalupur', 'Sarangpur', 'Dariapur'] },
    { wardNumber: '3', wardName: 'Jamalpur', areaNames: ['Jamalpur', 'Khanpur', 'Shahpur'] },
    { wardNumber: '4', wardName: 'Maninagar', areaNames: ['Maninagar', 'Kankaria', 'Isanpur'] },
    { wardNumber: '5', wardName: 'Navrangpura', areaNames: ['Navrangpura', 'CG Road', 'Paldi'] },
    { wardNumber: '6', wardName: 'Satellite', areaNames: ['Satellite', 'Prahlad Nagar', 'Vastrapur'] },
    { wardNumber: '7', wardName: 'Bopal', areaNames: ['Bopal', 'South Bopal', 'Ghuma'] },
    { wardNumber: '8', wardName: 'Thaltej', areaNames: ['Thaltej', 'SG Highway', 'Bodakdev'] },
    { wardNumber: '9', wardName: 'Gota', areaNames: ['Gota', 'Chandkheda', 'Tragad'] },
    { wardNumber: '10', wardName: 'Naroda', areaNames: ['Naroda', 'Nikol', 'Vastral'] }
  ],
  'Surat': [
    { wardNumber: '1', wardName: 'Athwa', areaNames: ['Athwa', 'Nanpura', 'Ghod Dod Road'] },
    { wardNumber: '2', wardName: 'Katargam', areaNames: ['Katargam', 'Amroli', 'Godadara'] },
    { wardNumber: '3', wardName: 'Varachha', areaNames: ['Varachha', 'Kapodra', 'Palanpur'] },
    { wardNumber: '4', wardName: 'Adajan', areaNames: ['Adajan', 'Pal', 'Vesu'] },
    { wardNumber: '5', wardName: 'Rander', areaNames: ['Rander', 'Jahangirpura', 'Sarthana'] }
  ],
  'Vadodara': [
    { wardNumber: '1', wardName: 'Alkapuri', areaNames: ['Alkapuri', 'Sayajigunj', 'Fatehgunj'] },
    { wardNumber: '2', wardName: 'Manjalpur', areaNames: ['Manjalpur', 'Gotri', 'Waghodia Road'] },
    { wardNumber: '3', wardName: 'Karelibaug', areaNames: ['Karelibaug', 'Productivity Road'] },
    { wardNumber: '4', wardName: 'Subhanpura', areaNames: ['Subhanpura', 'Vasna', 'Akota'] },
    { wardNumber: '5', wardName: 'Harni', areaNames: ['Harni', 'Sama', 'Tarsali'] }
  ],
  'Rajkot': [
    { wardNumber: '1', wardName: 'Kalavad Road', areaNames: ['Kalavad Road', 'University Road'] },
    { wardNumber: '2', wardName: 'Yagnik Road', areaNames: ['Yagnik Road', 'Dhebar Road'] },
    { wardNumber: '3', wardName: 'Amin Marg', areaNames: ['Amin Marg', 'Race Course'] },
    { wardNumber: '4', wardName: '150 Feet Ring Road', areaNames: ['150 Feet Ring Road', 'Mavdi'] },
    { wardNumber: '5', wardName: 'Raiya Road', areaNames: ['Raiya Road', 'Kotecha Chowk'] }
  ],
  'Gandhinagar': [
    { wardNumber: '1', wardName: 'Sector 1-7', areaNames: ['Sector 1', 'Sector 7', 'GH Road'] },
    { wardNumber: '2', wardName: 'Sector 8-14', areaNames: ['Sector 8', 'Sector 11', 'Infocity'] },
    { wardNumber: '3', wardName: 'Sector 15-21', areaNames: ['Sector 15', 'Sector 21', 'GIFT City'] },
    { wardNumber: '4', wardName: 'Sector 22-28', areaNames: ['Sector 22', 'Sector 28'] },
    { wardNumber: '5', wardName: 'Sector 29-30', areaNames: ['Sector 29', 'Sector 30', 'Kudasan'] }
  ]
};

// ----- SEED FUNCTION -----
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await District.deleteMany({});
    await Ward.deleteMany({});
    await ComplaintCategory.deleteMany({});

    // 1. Seed Districts
    console.log('📍 Seeding 33 Gujarat districts...');
    const districts = await District.insertMany(gujaratDistricts);
    console.log(`   ✅ ${districts.length} districts created`);

    // Create a map of district name → id for ward seeding
    const districtMap = {};
    districts.forEach(d => { districtMap[d.name] = d._id; });

    // 2. Seed Wards
    console.log('🏘️  Seeding sample wards...');
    let totalWards = 0;
    for (const [districtName, wards] of Object.entries(sampleWards)) {
      const districtId = districtMap[districtName];
      if (districtId) {
        const wardDocs = wards.map(w => ({
          ...w,
          district: districtId
        }));
        await Ward.insertMany(wardDocs);
        totalWards += wards.length;
        console.log(`   ✅ ${wards.length} wards for ${districtName}`);
      }
    }
    console.log(`   ✅ Total ${totalWards} wards created`);

    // 3. Seed Complaint Categories
    console.log('📂 Seeding complaint categories...');
    const categories = await ComplaintCategory.insertMany(complaintCategories);
    console.log(`   ✅ ${categories.length} categories created`);

    // 4. Create Super Admin (check if exists)
    console.log('👑 Creating Super Admin...');
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('   ⚠️  Super Admin already exists, skipping');
    } else {
      const superAdmin = await User.create({
        name: 'Super Admin',
        email: 'superadmin@rcms.com',
        mobile: '9999999999',
        password: 'admin123',
        role: 'super_admin'
      });
      console.log(`   ✅ Super Admin created (${superAdmin.email} / admin123)`);
    }

    console.log('\n🎉 Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   Districts: ${districts.length}`);
    console.log(`   Wards: ${totalWards}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Super Admin: superadmin@rcms.com / admin123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
