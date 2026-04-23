//connect mongoDB database
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Options are no longer needed in Mongoose 6+
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
