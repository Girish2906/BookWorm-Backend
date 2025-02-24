const express = require("express") ; 
const mongoose = require("mongoose") ; 
const validator = require("validator") ; 
const bookRouter = express.Router() ; 

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
    image: {
        type: String , 
        required: true , 
        default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5eNVTV_qLbt6LOsZepDWaVWqE6bh-yZp0Cw&s" , 
    } , 
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
    }
}) ; 