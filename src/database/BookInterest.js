const mongoose = require('mongoose') ; 

const BookInterest = mongoose.Schema({
    interestedById:  {
        type: mongoose.Schema.Types.ObjectId , 
        required: true , 
        ref: "User" , 
    } , 
    bookId: {
        type: mongoose.Schema.Types.ObjectId , 
        required: true , 
        ref: "Book" , 
    } , 
    uploadedById: {
        type: mongoose.Schema.Types.ObjectId , 
        ref: "User" , 
    } , 
    status: {
        type: String , 
        enum: ["interested" , "ongoing" , "success" , "delete"] , 
        required: true ,        
    } , 
    initialMessage: {
        type: String
    }
} , {timestamps: true}) ; 

module.exports = mongoose.model("BookInterest" , BookInterest) ; 