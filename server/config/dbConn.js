const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
    } catch (err) {
        console.log(err);
    }
}

module.exports = connectDB;