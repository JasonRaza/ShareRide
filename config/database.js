const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://jasonraza:SuperJaz98@cluster0.1hfhsly.mongodb.net/ShareRide');
        console.log('MongoDB Connected to ShareRide...');
    } catch(err){
        console.error(err.message);
        process.exit(1);
    }
};

module.exports = connectDB;