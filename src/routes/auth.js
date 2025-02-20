const express = require('express') ; 
const authRouter = express.Router() ; 
const bcrypt = require("bcrypt") ; 
const User = require("../database/User") ; 
const {validateUserData} = require("../utilityFunctions/validateData") ;
const {validateLoginData} = require("../utilityFunctions/validateData") ;
const userAuth = require("../middlewares/userAuth") ; 
const jwt = require("jsonwebtoken") ; 
authRouter.post("/register" , async (req , res) => {
    // res.status(200).json({isSuccess: true , data "User Registered"}) ; 
    try{
        const answer = validateUserData(req.body) ;
        // console.log("this is the answer",answer) ;  
        const {firstName , lastName , email , password, phoneNumber} = req.body ; 
        const passwordHash = await bcrypt.hash(password , 10) ; 
        const user = new User({firstName , lastName , email , password: passwordHash , phoneNumber}) ;
        const userSaved = await user.save() ;
        // res.send(req.body) ; 
        res.status(201).json({isSuccess: true , data: userSaved}) ; 
        // console.log(req.body) ; 
    } catch(error){
        return res.status(400).json({isSuccess: false , message: error.message}) ; 
    }
}) ; 

authRouter.post("/login" , async (req , res) => {
    try{
        validateLoginData(req.body) ; 
        const {email , password} = req.body ; 
        const user = await User.findOne({email: email}) ; 
        if(!user){
            throw new Error("User not found") ; 
        }
        const passwordCompare = await bcrypt.compare(password , user.password) ; 
        if(!passwordCompare){
            throw new Error("Password is incorrect") ; 
        }
        const token = await jwt.sign({_id: user._id} , process.env.JWT_SECRET , {
            expiresIn: "1d"
        }) ; 
        console.log(token) ; 
        res.cookie("token" , token) ; 
        
        return res.status(200).json({isSuccess: true , data: user}) ;
    } catch(error){
        return res.status(400).json({isSuccess: false , message: error.message}) ; 
    }
}) ; 

authRouter.get("/profile" , userAuth , async (req , res) => {
    try{
        const _id = req.user._id ; 
        const user = await User.findById(_id) ;
        return res.status(200).json({isSuccess: true , data: user});
    } catch(error){
        return res.status(400).json({isSuccess: false , message: error.message}) ; 
    }
}) ; 

authRouter.post("/logou1t" , async (req , res) => {
    try{
        const token = jwt.sign(null , {
            expiresIn: new Date(Date.now())
        }) ; 
        res.cookie("token" , token) ; 
        return res.status(200).json({isSuccess: true , message: "User Logged out"}) ; 
    } catch(error){
        return res.status(400).json({isSuccess: false , message: error.message}) ; 
    }
}) ; 
authRouter.post('/logout' , async (req , res) => {
    res.cookie("token" , null , {
        expires: new Date(Date.now()) 
    }) ; 
    res.send("Logged out successfully!") ; 
}) ; 

module.exports = authRouter ; 