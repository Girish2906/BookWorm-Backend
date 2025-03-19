const express = require("express") ; 
const bookRouter = express.Router() ; 
const {userAuth , userAuthBooks} = require("../middlewares/userAuth") ; 
const multer = require("multer") ; 
const Book = require("../database/book") ; 
const {validateBookUploadData} = require("../utilities/validateData") ; 
const {allowedGenres} = require("../utilities/constants") ; 
const {S3Client} = require("@aws-sdk/client-s3") ; 
const {PutObjectCommand} = require("@aws-sdk/client-s3") ; 

const accessKey = process.env.AWS_ACCESS_KEY ; 
const awsSecretKey = process.env.AWS_SECRET_KEY ; 
const bucketName = process.env.BUCKET_NAME ; 
const  bucketLocation = process.env.BUCKET_LOCATION ; 

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey , 
        secretAccessKey: awsSecretKey
    } , 
    region: bucketLocation
})

const Redis = require("ioredis") ; 
const redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    // password: "Iloveme@100", 
    // db: 0 
  });
// const redis = new Redis({
//     host: "localhost" , 
//     port: 6379
// })

const storage = multer.memoryStorage() ; 

const upload = multer({storage}) ; 

bookRouter.post("/upload/BookS3" , userAuth , upload.single("image") , async (req , res) => {
    try{
        // console.log(13 , "upload/book")
        validateBookUploadData(req) ; 
        const {name , author , pages , genre , price} = req.body ; 
        console.log(req.file) ; 
        const params = {
            Bucket: bucketName , 
            Key: req.file.originalname , 
            Body: req.file.buffer , 
            ContentType: req.file.mimetype , 
        }
        console.log("these are the params" , params) ; 
        const command = new PutObjectCommand(params) ; 
        const responseS3ImageSaving = await s3.send(command) ;
         console.log("response of S3 image saving",responseS3ImageSaving) ; 
        const uploadedById = req.user._id ; 
        const image = req?.file ; 
        // console.log(image);
        
        const base64BookImage = image ? image.buffer.toString('base64') : null ;  
        // console.log(base64BookImage);
        
        const newBook = new Book( {name , author , pages , genre , uploadedById , image :  base64BookImage, price} ) ; 
        const userGenre = genre.split(", ") ;
        if(! userGenre.every(genre => allowedGenres.includes(genre) ) ){
            throw new Error("Genre Not Allowed") ; 
        }
        const response = await newBook.save() ; 
        return res.status(200).json({isSuccess: true , data: response }) ; 

    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.post("/upload/BookBuffer" , userAuth , upload.single("image") , async (req , res) => {
    try{
        // console.log(13 , "upload/book")
        validateBookUploadData(req) ; 
        const {name , author , pages , genre , price} = req.body ; 
        console.log(req.file) ; 
        const params = {
            Bucket: bucketName , 
            Key: req.file.originalname , 
            Body: req.file.buffer , 
            ContentType: req.file.mimetype , 
        }
        console.log("these are the params" , params) ; 
        const command = new PutObjectCommand(params) ; 
        const responseS3ImageSaving = await s3.send(command) ;
         console.log("response of S3 image saving",responseS3ImageSaving) ; 
        const uploadedById = req.user._id ; 
        const image = req?.file ; 
        // console.log(image);
        
        const base64BookImage = image ? image.buffer.toString('base64') : null ;  
        // console.log(base64BookImage);
        
        const newBook = new Book( {name , author , pages , genre , uploadedById , image :  base64BookImage, price} ) ; 
        const userGenre = genre.split(", ") ;
        if(! userGenre.every(genre => allowedGenres.includes(genre) ) ){
            throw new Error("Genre Not Allowed") ; 
        }
        const response = await newBook.save() ; 
        return res.status(200).json({isSuccess: true , data: response }) ; 

    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.get("/book/genres" , userAuth ,  async (req , res) => {
    try{
        const allowedGenres = [
            "Horror", "Thriller", "Psychological Thriller","Mystery","Crime", "Fantasy", "Science ", "Dystopian", "Adventure","Historical Fiction", "Mythological Fiction","Supernatural","Paranormal","Romance","Contemporary Fiction", "Literary Fiction","Magical Realism", "Satire", "Gothic Fiction","Biography", "Autobiography", "Memoir","Self-Help","Personal Development","Psychology", "Philosophy","Science", "History", "Politics", "Economics","Business","Finance","Travel", "Religion & Spirituality", "True Crime","Essays","Journalism","Motivational", "Young Adult (YA)", "Children's Books", "Graphic Novels & Comics","Poetry", "Classic Literature","Short Stories", "Dark Fantasy","Cyberpunk","Steampunk","Hard Science Fiction","Post-Apocalyptic", "Feminist Literature", "LGBTQ+ Fiction"
        ] ; 
        return res.status(200).json({isSuccess: true , data: allowedGenres}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.put("/book/edit" , userAuth , upload.single("image") ,  async (req , res) => {
    try{
        const bookId = req.body.bookId ; 
        const book = await Book.findOne({_id: bookId}) ;  
        console.log(book.uploadedById , req.user._id) ; 
        if(!book.uploadedById.equals(req.user._id)){
            throw new Error("Can't edit books uploaded by others") ; 
        }
        const image = req?.file ; 
        const base64BookImage = image? image.buffer.toString('base64') : null ; 
        if(!book)
            throw new Error("Book not found") ; 
        else{
            book.set(req.body) ; 
            book.image = base64BookImage ; 
            const updatedBook = await book.save() ; 
            return res.status(200).json({isSuccess: true , data: updatedBook}) ; 

        }
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 


bookRouter.get("/book/getAllBooks", userAuthBooks , async (req , res) => {
    try{
        // console.log("passed the authenticaion somehow")
        // console.log(47 , req.user) ; 
        let books = [] ; 
        if( ! req.user){
            console.log("is it going here") ; 
            const cachedBooks = JSON.parse(await redis.get("listOfBooks")) ; 
            console.log(cachedBooks) ; 
            // console.log(cachedBooks) ; 
            if(!cachedBooks){
                console.log("if condition")
                books = await Book.find({}).populate("uploadedById" , "firstName lastName")
                await redis.set("listOfBooks", JSON.stringify(books));
            }
            else {
                console.log("else condition")
                books = cachedBooks ; 
            }
            console.log("redis cache hit") ; 
        } else{
            const _id= req.user._id ;
            const info = await redis.info() ;  
            console.log("cache hit" ) ; 
            // const result = await redis.get("")
            // await redis.set("test19March642", "Hello ioredis! I am able to see the values added in the redis server") 
            // .then((result) => console.log("Redis says:", result))
            // .catch(console.error);
            //query to get all books except the ones uploaded by the user
            // working query
            books = await Book.find({uploadedById: {$ne: _id }}).populate("uploadedById" , "firstName lastName") ; 
            // await redis.set("listOfBooks" , books) ; 
            await redis.set("listOfBooks", JSON.stringify(books));
        //query to get all autobiographies
        // books = await Book.find({genre: "Autobiography" ,  pages: {$gt: 500}}).populate("uploadedById").select("-image") ; 
        }
        return res.status(200).json({isSuccess: true , data: books}) ; 
    } catch(Error){
        console.log()
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookRouter.get("/book/booksByMe" , userAuth , async (req , res) => {
    try{
        const _id = req.user._id ; 
        const booksByMe = await Book.find({uploadedById: _id}) ; 
        console.log(booksByMe) ; 
        return res.status(200).json({isSuccess: true, data: booksByMe}) ; 
    } catch(Error){
        return res.status("404").json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

// beginning redis journey
// doing some setup => WSL, docker, redis
module.exports = bookRouter ; 