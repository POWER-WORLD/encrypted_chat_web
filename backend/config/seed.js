const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

/**
 * Pre-defined demo user accounts for testing and verification
 */
const SEED_USERS = [
    {
        name: 'Pawan Kumar',
        email: 'pawan@msgcrypt.com',
        password: 'Password123!',
        profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=PawanKumar&backgroundColor=050505',
    },
    {
        name: 'Cyber Operative',
        email: 'operative@msgcrypt.com',
        password: 'Password123!',
        profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=Operative&backgroundColor=050505',
    },
    {
        name: 'Guest Agent',
        email: 'guest@msgcrypt.com',
        password: 'Password123!',
        profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=GuestAgent&backgroundColor=050505',
    },
];

/**
 * Seeds default demo users and an initial encrypted chat thread
 * @param {Object} options - Seeding options ({ force: boolean })
 * @returns {Promise<Array<Object>>} Created or existing users
 */
const seedDatabase = async (options = { force: false }) => {
    try {
        const userCount = await User.countDocuments();

        if (userCount > 0 && !options.force) {
            console.log(`[SEED_INFO] Database already contains ${userCount} users. Skipping automatic seed.`);
            return await User.find({}).select('-password');
        }

        if (options.force) {
            console.log('[SEED_INFO] Force option enabled. Clearing existing users, chats, and messages...');
            await Promise.all([
                User.deleteMany({}),
                Chat.deleteMany({}),
                Message.deleteMany({}),
            ]);
        }

        console.log('[SEED_INFO] Seeding demo users into database...');
        const createdUsers = [];

        for (const userData of SEED_USERS) {
            const user = await User.create({
                name: userData.name,
                email: userData.email,
                password: userData.password, // userModel pre-save hook automatically hashes password
                profilePicture: userData.profilePicture,
            });
            createdUsers.push(user);
        }

        console.log(`[SEED_SUCCESS] Created ${createdUsers.length} demo users.`);

        // Create an initial direct chat between User 1 (Pawan) and User 2 (Operative)
        if (createdUsers.length >= 2) {
            const directChat = await Chat.create({
                chatName: 'Direct Encrypted Uplink',
                isGroupChat: false,
                users: [createdUsers[0]._id, createdUsers[1]._id],
            });

            const welcomeMessage = await Message.create({
                sender: createdUsers[0]._id,
                content: 'Welcome to MSG_CRYPT! Encrypted channel online and operational.',
                chat: directChat._id,
            });

            directChat.latestMessage = welcomeMessage._id;
            await directChat.save();

            // Create a demo Group Chat
            const groupChat = await Chat.create({
                chatName: 'Matrix Grid Alpha',
                isGroupChat: true,
                users: [createdUsers[0]._id, createdUsers[1]._id, createdUsers[2]._id],
                groupAdmin: createdUsers[0]._id,
            });

            const groupMessage = await Message.create({
                sender: createdUsers[1]._id,
                content: 'Grid Alpha standing by. Secure telemetry confirmed.',
                chat: groupChat._id,
            });

            groupChat.latestMessage = groupMessage._id;
            await groupChat.save();

            console.log('[SEED_SUCCESS] Initialized welcome direct and group chat channels.');
        }

        return createdUsers;
    } catch (error) {
        console.error('[SEED_ERROR] Error during database seeding:', error.message);
        throw error;
    }
};

// Standalone execution handler (`node config/seed.js` or `npm run seed`)
if (require.main === module) {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
    const { connectDB, disconnectDB } = require('./db');

    (async () => {
        try {
            console.log('\n======================================================');
            console.log('       MSG_CRYPT DATABASE SEEDING UTILITY             ');
            console.log('======================================================\n');

            await connectDB();
            const users = await seedDatabase({ force: true });

            console.log('\n======================================================');
            console.log('            DEMO CREDENTIALS FOR LOGIN                ');
            console.log('======================================================');
            users.forEach((u, idx) => {
                const rawPassword = SEED_USERS[idx]?.password || 'Password123!';
                console.log(`\nAccount #${idx + 1}: ${u.name}`);
                console.log(`  Email:    ${u.email}`);
                console.log(`  Password: ${rawPassword}`);
            });
            console.log('======================================================\n');

            await disconnectDB();
            process.exit(0);
        } catch (err) {
            console.error('Fatal seed failure:', err);
            process.exit(1);
        }
    })();
}

module.exports = {
    SEED_USERS,
    seedDatabase,
};

