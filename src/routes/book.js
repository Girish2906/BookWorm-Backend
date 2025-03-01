const express = require("express") ; 
const bookRouter = express.Router() ; 
const userAuth = require("../middlewares/userAuth") ; 
const multer = require("multer") ; 
const Book = require("../database/book") ; 
const {validateBookUploadData} = require("../utilities/validateData") ; 
const {allowedGenres} = require("../utilities/constants") ; 

const storage = multer.memoryStorage() ; 

const upload = multer({storage}) ; 

bookRouter.post("/upload/Book" , userAuth , upload.single("image") , async (req , res) => {
    try{
        console.log(13 , "upload/book")
        validateBookUploadData(req) ; 
        const {name , author , pages , genre} = req.body ; 
        const uploadedById = req.user._id ; 
        const image = req?.file ; 
        const base64BookImage = image ? image.buffer.toString('base64') : null ; 
        const newBook = new Book( {name , author , pages , genre , uploadedById , image: base64BookImage} ) ; 
        const userGenre = genre.split(", ") ;
        if(! userGenre.every(genre => allowedGenres.includes(genre) ) ){
            throw new Error("Genre Not Allowed") ; 
        }
        const response = await newBook.save()
        return res.status(200).json({isSuccess: true , data: response }) ; 

    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.get("/book/genres" , userAuth , async (req , res) => {
    try{
        const allowedGenres = [
            "Horror", "Thriller", "Psychological Thriller","Mystery","Crime", "Fantasy", "Science ", "Dystopian", "Adventure","Historical Fiction", "Mythological Fiction","Supernatural","Paranormal","Romance","Contemporary Fiction", "Literary Fiction","Magical Realism", "Satire", "Gothic Fiction","Biography", "Autobiography", "Memoir","Self-Help","Personal Development","Psychology", "Philosophy","Science", "History", "Politics", "Economics","Business","Finance","Travel", "Religion & Spirituality", "True Crime","Essays","Journalism","Motivational", "Young Adult (YA)", "Children's Books", "Graphic Novels & Comics","Poetry", "Classic Literature","Short Stories", "Dark Fantasy","Cyberpunk","Steampunk","Hard Science Fiction","Post-Apocalyptic", "Feminist Literature", "LGBTQ+ Fiction"
        ] ; 
        return res.status(200).json({isSuccess: true , data: allowedGenres}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.get("/getAllBooks" , userAuth , async (req , res) => {
    try{
        // const books = await Book.find({}).populate("uploadedById" , "firstName lastName photo") ; 
        // const books = await Book.find({}).populate("uploadedById" , "firstName lastName photo").select('-_id') ;
        // const books = await Book.find({}).select('-_id').populate("uploadedById" , "firstName lastName photo").select('-_id') ; 
        // const books = await Book.find({}).populate({ path: "uploadedById", select: "firstName lastName photo -_id" }).select('-_id');  
        // const books = await Book.find({}).select('name author pages genre -_id').populate('uploadedById').select('firstName lastName -_id') ; 
        // const books = await Book.find({}).populate('uploadedById').select('firstName lastName -_id') ; 
        const books = await Book.find({}) ; 
        return res.status(200).json({isSuccess: true , data: books}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

module.exports = bookRouter ; 