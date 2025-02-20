const express = require("express") ; 
const app = express() ; 
const jwt = require("jsonwebtoken") ;
const User = require("../database/User");
const userAuth = async (req , res , next) => {
    try{
        console.log("userAuth file")
        const token = req.cookies.token ; 
        if(!token){
            throw new Error("You don't have the token, please Login") ; 
        }
        const decodedObj =  jwt.verify(token , process.env.JWT_SECRET) ; 
        console.log("this is the decoded object" , decodedObj) ; 
        const{_id} = decodedObj ; 
        const user = await User.findById(_id) ; 
        if(!user){
            throw new Error("User not found") ; 
        }
        req.user = user ; 
        console.log("this is the req.user" , req.user) ; 
        next() ; 
    } catch(error){
        return res.status(401).json({isSuccess: false , message: error.message}) ; 
    }
} ; 

module.exports = userAuth ; 