const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Crop = require('./models/Crop');
const Task = require('./models/Task');

// Sample data
const sampleUsers = [
  {
    name: 'James Mwangi',
    email: 'james@farmlink.ke',
    password: 'password123',
    farmLocation: 'Kisumu County'
  },
  {
    name: 'Grace Wanjiku',
    email: 'grace@farmlink.ke',
    password: 'password123',
    farmLocation: 'Nakuru County'
  }
];

const sampleCrops = [
  {
    name: 'Maize',
    plantingDate: new Date('2025-01-15'),
    expectedHarvestDate: new Date('2025-05-15'),
    notes: 'Planted with DAP fertilizer. Good rainfall this season.',
    status: 'Growing'
  },
  {
    name: 'Beans',
    plantingDate: new Date('2025-02-01'),
    expectedHarvestDate: new Date('2025-04-30'),
    notes: 'Intercropped with maize. Using improved seeds.',
    status: 'Growing'
  },
  {
    name: 'Sukuma Wiki',
    plantingDate: new Date('2025-01-20'),
    expectedHarvestDate: new Date('2025-03-20'),
    notes: 'For daily consumption and local market sales.',
    status: 'Ready to Harvest'
  },
  {
    name: 'Tomatoes',
    plantingDate: new Date('2024-11-15'),
    expectedHarvestDate: new Date('2025-02-15'),
    notes: 'Previous harvest completed. Good yield of 500kg.',
    status: 'Harvested'
  }
];

const sampleTasks = [
  {
    description: 'Apply second fertilizer application to maize',
    dueDate: new Date('2025-07-20'),
    status: 'Pending',
    priority: 'High'
  },
  {
    description: 'Weed beans field thoroughly',
    dueDate: new Date('2025-07-18'),
    status: 'Pending',
    priority: 'Medium'
  },
  {
    description: 'Harvest mature sukuma wiki leaves',
    dueDate: new Date('2025-07-15'),
    status: 'Pending',
    priority: 'High'
  },
  {
    description: 'Spray pesticides on tomato seedlings',
    dueDate: new Date('2025-07-25'),
    status: 'Pending',
    priority: 'Medium'
  },
  {
    description: 'Prepare land for next planting season',
    dueDate: new Date('2025-07-10'),
    status: 'Completed',
    priority: 'Low'
  }
];

const seedDatabase = async() => {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmlink';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('🔌 Connected to MongoDB for seeding');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Crop.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }

    // Create crops for first user
    console.log('🌱 Creating sample crops...');
    const createdCrops = [];

    for (const cropData of sampleCrops) {
      const crop = new Crop({
        ...cropData,
        userId: createdUsers[0]._id
      });
      await crop.save();
      createdCrops.push(crop);
      console.log(`✅ Created crop: ${crop.name} (${crop.status})`);
    }

    // Create tasks linked to crops
    console.log('📝 Creating sample tasks...');

    for (let i = 0; i < sampleTasks.length; i++) {
      const taskData = sampleTasks[i];
      const cropIndex = i % createdCrops.length; // Distribute tasks across crops

      const task = new Task({
        ...taskData,
        userId: createdUsers[0]._id,
        cropId: createdCrops[cropIndex]._id
      });

      await task.save();
      console.log(`✅ Created task: ${task.description} (${task.status})`);
    }

    // Add some data for second user
    console.log('🌾 Creating data for second user...');

    const secondUserCrop = new Crop({
      name: 'Maize',
      plantingDate: new Date('2025-02-10'),
      expectedHarvestDate: new Date('2025-06-10'),
      notes: 'First time farmer. Using hybrid seeds.',
      status: 'Growing',
      userId: createdUsers[1]._id
    });
    await secondUserCrop.save();

    const secondUserTask = new Task({
      description: 'Learn about proper spacing for maize',
      dueDate: new Date('2025-07-16'),
      status: 'Pending',
      priority: 'High',
      userId: createdUsers[1]._id,
      cropId: secondUserCrop._id
    });
    await secondUserTask.save();

    console.log('✅ Sample data created successfully!');
    console.log('\n📊 Database Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🌱 Crops: ${await Crop.countDocuments()}`);
    console.log(`📝 Tasks: ${await Task.countDocuments()}`);

    console.log('\n🔐 Test User Credentials:');
    console.log('Email: james@farmlink.ke');
    console.log('Password: password123');
    console.log('Location: Kisumu County');

    console.log('\nEmail: grace@farmlink.ke');
    console.log('Password: password123');
    console.log('Location: Nakuru County');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
