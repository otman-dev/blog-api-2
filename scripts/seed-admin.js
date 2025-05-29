// seed-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Default admin user configuration
const ADMIN_EMAIL = 'admin@blog-api.com';
const ADMIN_PASSWORD = 'adminSecret123';
const ADMIN_NAME = 'Admin User';

// MongoDB connection string for users (different from blog content)
const MONGODB_URI = 'mongodb://rasmus:wordpiss@adro.ddns.net:27017/blog-api?authSource=admin';

// Hash password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function seedAdmin() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
    }, {
      timestamps: true,
    });

    // Get User model (create if not exists)
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
    if (existingAdmin) {
      console.log('🔄 Admin user already exists. Skipping creation.');
      return;
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(ADMIN_PASSWORD);
    
    // Create the admin user
    const admin = new User({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', ADMIN_EMAIL);
    console.log('🔑 Password:', ADMIN_PASSWORD);
    console.log('⚠️  Make sure to change this password in production!');
    
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    console.log('🔄 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seed function
seedAdmin();
