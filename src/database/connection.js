const mongoose = require("mongoose") ; 
const connectDB = async () => {
    const mongoDBURL = process.env.DB_CONNECTION_SECRET ; 
    await mongoose.connect(mongoDBURL) ; 
}

module.exports = connectDB ; 