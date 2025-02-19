const express = require("express") ; 
const app = express() ; 
const connectDB = require("./database/connection") ; 
// require("dotenv").config() ;
// const dotenv = require('dotenv');
require('dotenv').config({ path: './src/.env' });

connectDB().then(() => {
    console.log("Connected to the Database") ; 
    app.listen(3000 , () => {
        console.log("Server is running on port 3000") ;
    } )
}).catch(() => {
    console.log("Cannot Connect to the Database") ; 
})