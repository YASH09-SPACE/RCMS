require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const District = require('../models/District');
const Ward = require('../models/Ward');

// 33 Districts of Gujarat with their respective Talukas and Municipal Wards
const gujaratData = {
  "Ahmedabad": { wards: ["Navrangpura Ward", "Maninagar Ward", "Paldi Ward", "Vastrapur Ward"], talukas: ["Daskroi", "Sanand", "Bavla", "Dholka", "Viramgam", "Mandal", "Detroj-Rampura"] },
  "Surat": { wards: ["Rander Ward", "Adajan Ward", "Athwalines Ward", "Katargam Ward"], talukas: ["Chorasi", "Olpad", "Kamrej", "Mangrol", "Mandvi", "Umarpada", "Bardoli", "Mahuva", "Palsana"] },
  "Vadodara": { wards: ["Sayajigunj Ward", "Alkapuri Ward", "Gorwa Ward", "Makarpura Ward"], talukas: ["Savli", "Vaghodia", "Padra", "Karjan", "Shinore", "Dabhoi", "Desar"] },
  "Rajkot": { wards: ["West Zone Ward", "Central Zone Ward", "East Zone Ward"], talukas: ["Paddhari", "Lodhika", "Kotda Sangani", "Jasdan", "Gondal", "Jam Kandorna", "Upleta", "Dhoraji", "Vinchhiya"] },
  "Bhavnagar": { wards: ["North Ward", "South Ward", "East Ward", "West Ward"], talukas: ["Vallabhipur", "Umrala", "Shihor", "Gariadhar", "Palitana", "Mahuva", "Talaja", "Jesar", "Ghogha"] },
  "Jamnagar": { wards: ["City Ward 1", "City Ward 2"], talukas: ["Jodiya", "Dhrol", "Kalavad", "Lalpur", "Jamjodhpur"] },
  "Junagadh": { wards: ["Junagadh City Ward A", "Junagadh City Ward B"], talukas: ["Bhesan", "Visavadar", "Mendarda", "Vanthali", "Manavadar", "Keshod", "Mangrol", "Maliya Hatina"] },
  "Gandhinagar": { wards: ["Sector 1-10 Ward", "Sector 11-20 Ward", "Sector 21-30 Ward"], talukas: ["Kalol", "Dahegam", "Mansa"] },
  "Anand": { talukas: ["Anand", "Borsad", "Anklav", "Petlad", "Sojitra", "Tarapur", "Khambhat", "Umreth"] },
  "Navsari": { talukas: ["Navsari", "Jalalpor", "Gandevi", "Chikhli", "Vansda", "Khergam"] },
  "Surendranagar": { talukas: ["Wadhwan", "Limbdi", "Chuda", "Sayla", "Thangadh", "Chotila", "Muli", "Dhrangadhra", "Dasada"] },
  "Morbi": { talukas: ["Morbi", "Maliya", "Tankara", "Wankaner", "Halvad"] },
  "Bharuch": { talukas: ["Bharuch", "Ankleshwar", "Hansot", "Jambusar", "Amod", "Vagra", "Jhagadia", "Valia", "Netrang"] },
  "Amreli": { talukas: ["Amreli", "Lathi", "Lilia", "Kunkavav", "Babra", "Dhari", "Khambha", "Rajula", "Jafrabad", "Savarkundla"] },
  "Aravalli": { talukas: ["Modasa", "Bhiloda", "Meghraj", "Malpur", "Dhansura", "Bayad"] },
  "Banaskantha": { talukas: ["Palanpur", "Deesa", "Dhanera", "Dantiwada", "Amirgadh", "Danta", "Vadgam", "Bhabhar", "Deodar", "Kankrej", "Tharad", "Vav", "Sui Gam", "Lakhani"] },
  "Botad": { talukas: ["Botad", "Gadhada", "Barwala", "Ranpur"] },
  "Chhota Udaipur": { talukas: ["Chhota Udaipur", "Pavi Jetpur", "Kavant", "Nasvadi", "Sankheda", "Bodeli"] },
  "Dahod": { talukas: ["Dahod", "Zalod", "Fatepura", "Garbada", "Limkheda", "Sanjeli", "Dhanpur", "Devgadh Baria"] },
  "Dang": { talukas: ["Ahwa", "Subir", "Waghai"] },
  "Devbhoomi Dwarka": { talukas: ["Khambhalia", "Kalyanpur", "Bhanvad", "Okhamandal"] },
  "Gir Somnath": { talukas: ["Veraval", "Patan", "Sutrapada", "Kodinar", "Una", "Gir Gadhada"] },
  "Kheda": { talukas: ["Nadiad", "Matar", "Kheda", "Mehmdabad", "Mahudha", "Kathlal", "Kapadvanj", "Balasinor", "Virpur"] },
  "Kutch": { talukas: ["Bhuj", "Lakhpat", "Abdasa", "Nakhatrana", "Mandvi", "Mundra", "Anjar", "Adipur", "Gandhidham", "Bhachau", "Rapar"] },
  "Mahisagar": { talukas: ["Lunawada", "Kadana", "Khanpur", "Santrampur", "Balasinor", "Virpur"] },
  "Mehsana": { talukas: ["Mehsana", "Satyasan", "Kadi", "Becharaji", "Vadnagar", "Kheralu", "Unjha", "Visnagar"] },
  "Narmada": { talukas: ["Rajpipla", "Tilakwada", "Dediapada", "Sagbara", "Garudeshwar"] },
  "Panchmahal": { talukas: ["Godhra", "Halol", "Kalol", "Jambughoda", "Shehera", "Morwa Hadaf", "Goghamba"] },
  "Patan": { talukas: ["Patan", "Santalpur", "Radhanpur", "Sami", "Harij", "Chanasma"] },
  "Porbandar": { talukas: ["Porbandar", "Ranavav", "Kutiyana"] },
  "Sabarkantha": { talukas: ["Himatnagar", "Idar", "Prantij", "Talod", "Khedbrahma", "Vadali", "Vijaynagar", "Poshina"] },
  "Tapi": { talukas: ["Vyara", "Songadh", "Valod", "Uchhal", "Nizar", "Kukarmunda"] },
  "Valsad": { talukas: ["Valsad", "Pardi", "Dharampur", "Kaprada", "Umbergaon", "Vapi"] }
};

const seedGujarat = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database. Initiating massive seed...');

    console.log('Wiping old Districts, Wards, Admins, and Constructors to prevent duplication...');
    await District.deleteMany({});
    await Ward.deleteMany({});
    await User.deleteMany({ role: { $in: ['admin', 'constructor'] } });
    console.log('Wipe complete.');

    let districtCount = 0;
    let wardCount = 0;
    let adminCount = 0;
    let constructorCount = 0;

    for (const [dName, dData] of Object.entries(gujaratData)) {
      // Create District
      const district = await District.create({
        name: dName,
        code: dName.substring(0, 3).toUpperCase() + districtCount.toString(),
        state: 'Gujarat',
        geofencePolygon: null
      });

      console.log(`[+] Created District: ${dName}`);
      districtCount++;

      // Compile sub-regions (Wards + Talukas)
      const subRegions = [];
      if (dData.wards) {
        dData.wards.forEach(w => subRegions.push({ name: w, type: 'Ward' }));
      }
      if (dData.talukas) {
        dData.talukas.forEach(t => subRegions.push({ name: `${t} Taluka`, type: 'Taluka' }));
      }

      for (let i = 0; i < subRegions.length; i++) {
        const sr = subRegions[i];
        
        // Use Ward Schema to store Talukas and Wards identically (for backend stability)
        const wardEntry = await Ward.create({
          district: district._id,
          wardName: sr.name,
          wardNumber: (i + 1).toString(),
          pincodes: [`${380000 + districtCount + i}`]
        });
        wardCount++;

        // Create 1 Admin for this Taluka/Ward - Use district name prefix to avoid duplicates
        const uniqueIdentifier = `${dName.toLowerCase().replace(/\s+/g, '_')}_${sr.name.toLowerCase().replace(/\s+/g, '_')}`;
        const adminEmail = `admin_${uniqueIdentifier}@rcms.com`;
        const adminUser = await User.create({
          name: `${sr.name} Administrator (${dName})`,
          email: adminEmail,
          mobile: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: 'Password123',
          role: 'admin',
          district: district._id,
          ward: wardEntry._id
        });
        adminCount++;

        // Create exactly 1 Constructor for performance instead of 3 to speed up bcrypt
        const cEmail = `worker_${uniqueIdentifier}@rcms.com`;
        await User.create({
          name: `${sr.name} Contractor (${dName})`,
          email: cEmail,
          mobile: `88${Math.floor(10000000 + Math.random() * 90000000)}`,
          password: 'Password123',
          role: 'constructor',
          district: district._id,
          ward: wardEntry._id
        });
        constructorCount++;
      }
    }

    console.log('\n✅ Mass Seeding Complete!');
    console.log(`Successfully generated ${districtCount} Districts.`);
    console.log(`Successfully generated ${wardCount} Talukas/Wards.`);
    console.log(`Successfully generated ${adminCount} Admins.`);
    console.log(`Successfully generated ${constructorCount} Constructors.`);
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seedGujarat();
