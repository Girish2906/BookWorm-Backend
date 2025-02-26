const express = require("express") ; 
const bookRouter = express.Router() ; 
const userAuth = require("../middlewares/userAuth") ; 
const multer = require("multer") ; 
const {validateBookUploadData} = require("../utilityFunctions/validateData") ; 
const Book = require("../database/book") ; 

const storage = multer.memoryStorage() ; 

const upload = multer({storage}) ; 

bookRouter.post("/upload/Book" , userAuth , upload.single("image") , async (req , res) => {
    try{
        console.log(13 , "upload/book")
        validateBookUploadData(req) ; 
        const {name , author , pages , genre} = req.body ; 
        const image = req?.file ; 
        // console.log(image) ; 
        const base64BookImage = image ? image.buffer.toString('base64') : null ; 
        // console.log(19  , base64BookImage) ; 
        const newBook = new Book( {name , author , pages , genre , image: base64BookImage} ) ; 
        const response = await newBook.save() ; 
        console.log(23 , "this is the response" , response) ; 
        return res.status(200).json({isSuccess: true , data: response }) ; 
        // console.log("this is the req. file in the book router" , req?.file) ; 

    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

module.exports = bookRouter ; 