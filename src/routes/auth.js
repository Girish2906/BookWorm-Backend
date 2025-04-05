const express = require('express') ; 
const authRouter = express.Router() ; 
const bcrypt = require("bcrypt") ; 
const User = require("../database/User") ; 
const {validateUserData} = require("../utilities/validateData") ;
const {validateLoginData} = require("../utilities/validateData") ;
const {userAuth} = require("../middlewares/userAuth") ; 
const jwt = require("jsonwebtoken") ; 
const multer = require("multer") ; 

const storage1 = multer.memoryStorage({
    destination: (req , file , cb) => {
        cb(null , 'uploads/')
    } , 
    filename: (req , file , cb) => {
        const suffix = Date.now() ; 
        // console.log(17 , "$!$@") ; 
        cb(null , suffix + '-' + file.originalname) ; 
    }
}) ;  

const storage = multer.memoryStorage() ;  

const upload = multer({storage}) ; 

authRouter.post("/register" , upload.single('photo') , async (req , res) => {
    // res.status(200).json({isSuccess: true , data "User Registered"}) ; 
    try{
        // console.log("this is the request: ",req) ; 
        const answer = validateUserData(req.body) ;
        // console.log("this is the answer",answer) ;  
        const {firstName , lastName , email , password, phoneNumber } = req.body ; 
        // console.log("re.file @~!#@!", req?.file?.path , req?.file , req?.file?.buffer) ; 
        const photoPath = req?.file?.path; 
        const photoBase64 = req.file ? req.file.buffer.toString('base64') : null ; 
        // console.log("1341" , photoBase64);
        
        // const photo = req?.file ? req.file.path : null ; 
        // console.log("this is the photo: ",photo) ; 
        const passwordHash = await bcrypt.hash(password , 10) ; 
        // const user = new User({firstName , lastName , email , password: passwordHash , phoneNumber , photo }) ; 
        const user = new User({firstName , lastName , email , password: passwordHash , phoneNumber , photo: photoBase64 }) ; 
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
        // res.cookie("token" , token) ; 
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,         
            sameSite: "None",     
            path: "/",            
        });

        // res.cookie("token" , token) ; 
        
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



authRouter.post('/logout' , async (req , res) => {
    console.log("These are the cookies: ",req?.cookies) ; 
    res.cookie("token" , null , {
        expires: new Date(Date.now()) 
    }) ; 
    return res.status(200).json({isSuccess: true , message: "User Logged Out"}) ; 
}) ; 


module.exports = authRouter ; 