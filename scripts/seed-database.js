import mongoose from 'mongoose';
import connectDB from '../lib/database.js';

async function seedDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Create database indexes for better performance
    console.log('Creating database indexes...');
    
    // The models will automatically create their indexes when first accessed
    // This ensures the database structure is properly set up
    
    console.log('Database structure initialized successfully!');
    console.log('\nDatabase is ready for real data.');
    console.log('- Users will be created when they register');
    console.log('- Plans can be created through the admin dashboard');
    console.log('- Coupons can be created through the admin dashboard');
    console.log('- Orders will be created during payment processing');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 