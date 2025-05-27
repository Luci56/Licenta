
// scripts/clearDatabase.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');
const User = require('../models/User');
const ChatLog = require('../models/ChatLog');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const clearDatabase = async (options = {}) => {
  try {
    console.log('🗑️  Database Cleanup Tool\n');

    // Count existing data
    const userCount = await User.countDocuments();
    const chatCount = await ChatLog.countDocuments();

    console.log(`📊 Current Database Contents:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Chat Logs: ${chatCount}\n`);

    if (userCount === 0 && chatCount === 0) {
      console.log('✅ Database is already empty!');
      return;
    }

    // Determine what to clear
    let clearUsers = options.users !== false;
    let clearChats = options.chats !== false;

    if (!options.skipConfirmation) {
      console.log('⚠️  WARNING: This will permanently delete data!\n');

      if (userCount > 0) {
        const userAnswer = await askQuestion(`Clear all ${userCount} users and their medical data? (yes/no): `);
        clearUsers = userAnswer.toLowerCase() === 'yes';
      }

      if (chatCount > 0) {
        const chatAnswer = await askQuestion(`Clear all ${chatCount} chat logs? (yes/no): `);
        clearChats = chatAnswer.toLowerCase() === 'yes';
      }

      if (!clearUsers && !clearChats) {
        console.log('❌ No data will be cleared. Exiting...');
        return;
      }

      const finalConfirm = await askQuestion('\n🔴 FINAL CONFIRMATION: Are you absolutely sure? Type "DELETE" to proceed: ');
      if (finalConfirm !== 'DELETE') {
        console.log('❌ Operation cancelled.');
        return;
      }
    }

    console.log('\n🧹 Starting cleanup...');

    // Clear users
    if (clearUsers && userCount > 0) {
      console.log(`🗑️  Clearing ${userCount} users...`);
      const userResult = await User.deleteMany({});
      console.log(`✅ Deleted ${userResult.deletedCount} users`);
    }

    // Clear chat logs
    if (clearChats && chatCount > 0) {
      console.log(`🗑️  Clearing ${chatCount} chat logs...`);
      const chatResult = await ChatLog.deleteMany({});
      console.log(`✅ Deleted ${chatResult.deletedCount} chat logs`);
    }

    // Reset any auto-increment counters if using them
    console.log('🔄 Resetting database indexes...');
    
    // Verify cleanup
    const remainingUsers = await User.countDocuments();
    const remainingChats = await ChatLog.countDocuments();

    console.log('\n📊 Cleanup Results:');
    console.log(`   Remaining Users: ${remainingUsers}`);
    console.log(`   Remaining Chat Logs: ${remainingChats}`);

    if (remainingUsers === 0 && remainingChats === 0) {
      console.log('\n✅ Database successfully cleared!');
      console.log('\n💡 You can now:');
      console.log('   1. Populate with new data: npm run populate:medium');
      console.log('   2. Start fresh with real patient data');
      console.log('   3. Run the application with an empty database');
    } else {
      console.log('\n⚠️  Some data may still remain in the database.');
    }

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();

    // Check for command line options
    const args = process.argv.slice(2);
    const options = {
      skipConfirmation: args.includes('--force') || args.includes('-f'),
      users: !args.includes('--no-users'),
      chats: !args.includes('--no-chats')
    };

    if (args.includes('--help') || args.includes('-h')) {
      console.log('🗑️  Database Cleanup Tool\n');
      console.log('Usage: npm run clear:database [options]\n');
      console.log('Options:');
      console.log('  --force, -f       Skip confirmation prompts');
      console.log('  --no-users        Don\'t clear user data');
      console.log('  --no-chats        Don\'t clear chat logs');
      console.log('  --help, -h        Show this help message\n');
      console.log('Examples:');
      console.log('  npm run clear:database                 # Interactive cleanup');
      console.log('  npm run clear:database -- --force      # Force cleanup without prompts');
      console.log('  npm run clear:database -- --no-chats   # Clear only users, keep chats');
      process.exit(0);
    }

    await clearDatabase(options);

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
};

// Handle signals gracefully
process.on('SIGINT', () => {
  console.log('\n👋 Goodbye!');
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  rl.close();
  mongoose.connection.close();
  process.exit(0);
});

main();