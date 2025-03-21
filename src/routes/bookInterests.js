const express = require('express') ; 
const bookInterestRouter = express.Router() ; 
const {userAuth} = require("../middlewares/userAuth") ; 
const BookInterest = require("../database/BookInterest") ; 
const User = require("../database/User") ; 
const Book = require("../database/book") ; 

// this API is mainly for interested in the book from the sender side
bookInterestRouter.post("/bookInterest/:status/:bookId" , userAuth , async (req , res) => {
    try{
        const {status , bookId} = req.params ; 
        const {message} = req?.body; 
        console.log(message) ; 
        const allowedStatus =  ["interested" , "ongoing" , "success" , "delete"]  ;  
        if(!status || !bookId || ( !allowedStatus.includes(status))){
            throw new Error("Invalid URL") ; 
        } 
        const validBook = await Book.findOne({_id: bookId}) ; 
        if(!validBook){ throw new Error("Book Doesn't Exist") ; }
        console.log(20 , validBook) ; 
        // validBookInterets1 and validBookInterest are the same queries, just the second one is cleaner, as mongoose by defaults apply the and operator to the different queries
        const validBookInterest1 = await BookInterest.find(
            {
            $and: [
                {bookId: bookId} , 
                {interestedById: req.user._id} , 
                {status: {$in: ["interested" , "ongoing" , "success"]}}
            ]
        }
        ) ; 
        console.log(validBook.uploadedById  , req.user.id) ; 

        if(validBook.uploadedById.equals (req.user._id)){
            console.log(validBook._id  , req.user.id) ; 
            throw new Error("Book Uploaded By Yourself!") ; 
        }
        // const validBookInterest = await BookInterest.find(
        //         {bookId: bookId} , 
        //         {interestedById: req.user._id} , 
        //         {status: {$in: ["interested" , "ongoing" , "success"]}}
        // ) ; 
        const validBookInterest = await BookInterest.find({
            bookId: bookId, 
            interestedById: req.user._id, 
            status: { $in: ["interested", "ongoing", "success"] }
        });
        
        if(validBookInterest.length > 0) throw new Error("You have already shown interest in this book") ; 
        const newBookInterest = new BookInterest({
            bookId , status , interestedById: req.user._id , initialMessage: message
        }) ; 
        const data = await newBookInterest.save() ; 
        return res.status(200).json({isSuccess: true , data}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
} ) ; 

bookInterestRouter.post("/bookInterest/find" , userAuth , async (req , res) => {
    try{
        const {bookId , interestedById} = req.body ; 
        if(!bookId || !interestedById){
            throw new Error("Invalid Request Body") ; 
        }
        console.log(bookId , interestedById) ; 
        const duplicateRequest = await BookInterest.find(
            {bookId: bookId} , 
            {interestedById: req.user._id} , 
        ).populate("interestedById" , "firstName lastName")
        console.log(duplicateRequest) ; 
        res.send(duplicateRequest) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookInterestRouter.get('/bookInterest/getAllInterests' , userAuth , async (req , res) => {
    try{
        // const books = await BookInterest.find().populate("bookId").populate("uploadedById") ; 
        const books = await BookInterest.find().populate({
            path: "bookId",
            populate: { path: "uploadedById" , match: { _id : req.user._id } }
        }) ; 
        

        return res.status(200).json({isSuccess: true , data: books}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 
   

module.exports = bookInterestRouter ; 