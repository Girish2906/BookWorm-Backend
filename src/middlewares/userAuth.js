const express = require("express") ; 
const app = express() ; 
const jwt = require("jsonwebtoken") ;
const User = require("../database/User");
const userAuth = async (req , res , next) => {
    try{
        // console.log("userAuth file")
        const token = req.cookies.token ; 
        // console.log("original URL , original Path" , req.originalUrl , req.path )
        
        if(!token){
            throw new Error("You don't have the token, please Login") ; 
        }
        const decodedObj =  jwt.verify(token , process.env.JWT_SECRET) ; 
        // console.log("this is the decoded object" , decodedObj) ; 
        const{_id} = decodedObj ; 
        const user = await User.findById(_id) ; 
        if(!user){
            throw new Error("User not found") ; 
        }
        req.user = user ; 
        // console.log("this is the req.user" , req.user) ; 
        next() ; 
    } catch(error){
        return res.status(401).json({isSuccess: false , message: error.message}) ; 
    }
} ; 

const userAuthBooks = async (req , res , next) => {
    // console.log("userAuthBooks middleware")
    try{
        const token = req.cookies.token ; 
        // console.log("original URL , original Path" , req.originalUrl , req.path )
        if(req.path === '/book/getAllBooks' && !token){
            // console.log("without token we have to return all books") ;
           return next() ; 
        }
        // console.log("are we coming here") ; 
        if(!token){
            throw new Error("You don't have the token, please Login") ; 
        }                                                                                                                                               
        const decodedObj =  jwt.verify(token , process.env.JWT_SECRET) ; 
        const{_id} = decodedObj ; 
        const user = await User.findById(_id) ; 
        if(!user){
            throw new Error("User not found") ; 
        }
        req.user = user ; 
        next() ; 
    } catch(error){
        // throw new Error(error.message); 
        return res.status(401).json({isSuccess: false , message: error.message}) ; 
    }
} ; 
// module.exports = userAuth ; 
module.exports = {userAuth , userAuthBooks} ; 