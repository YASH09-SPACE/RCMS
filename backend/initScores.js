require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const PerformanceScore = require('./models/PerformanceScore');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rcms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('MongoDB Connected');
  
  const users = await User.find({ role: { $in: ['admin', 'constructor'] } });
  console.log(`Found ${users.length} admins and constructors.`);
  
  let initializedCount = 0;
  
  for (const user of users) {
    const existing = await PerformanceScore.findOne({ user: user._id });
    if (!existing) {
      await PerformanceScore.create({
        user: user._id,
        role: user.role,
        currentScore: 100,
        level: 'excellent'
      });
      initializedCount++;
    }
  }
  
  console.log(`Successfully initialized ${initializedCount} missing performance scores.`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
