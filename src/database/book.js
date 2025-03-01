const express = require("express") ; 
const mongoose = require("mongoose") ; 
const validator = require("validator") ; 
const bookRouter = express.Router() ; 
const User = require("./User") ; 

const Book = mongoose.Schema({
    name: {
        type: String , 
        required: true , 
        validate: {
            validator: function(v){
                if(v && v.length < 5){
                    throw new Error("Please Enter Proper Name of the Book") ; 
                }
            }
        }
    } , 
    author: {
        type: String , 
        required: true , 
        validator: function(v){
            if(v && v.length < 5){
                throw new Error("Please Enter Proper Name of the Author") ; 
            }
        }
    } , 
    pages: {
        type: Number , 
        required: true , 
        validator: {
            validate: (v) => {
                if(v > 5000)
                    throw new Error("Please Enter Valid Number of Pages") ; 
            }
        }
    },
    genre: {
        type: [String] , 
        required: true , 
        validate: {
            validator: (genre) => {
                if(genre.length > 4){
                    throw new Error("You cannot Enter More Than 4 Genres") ; 
                }
            }
        }
    },
   uploadedById: {
    type: mongoose.Schema.Types.ObjectId , 
    required: true , 
    ref: "User"
   } , 
   image: {
        type: String , 
        required: true , 
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5eNVTV_qLbt6LOsZepDWaVWqE6bh-yZp0Cw&s" , 
    } , 
}, {timestamps: true}) ; 

module.exports = mongoose.model("Book" , Book) ; 