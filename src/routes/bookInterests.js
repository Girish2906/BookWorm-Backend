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
        const {bookInterestId} = req.body  ; 
        const {message} = req?.body; 
        // console.log(message) ; 
        const allowedStatus =  ["interested" , "ongoing" , "success" , "delete"]  ;  
        if(!status || !bookId || ( !allowedStatus.includes(status))){
            throw new Error("Invalid URL") ; 
        } 
        const validBook = await Book.findOne({_id: bookId}) ; 
        if(!validBook){ throw new Error("Book Doesn't Exist") ; }
        const uploadedById = validBook.uploadedById ; 
        // console.log(20 , validBook) ; 
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
        // console.log(validBook.uploadedById  , req.user.id) ; 
        if(status === 'ongoing'){
            const interest = await BookInterest.findOne({_id: bookInterestId}) ; 
            console.log("this is the interest" , interest) ; 
            if(interest.uploadedById && interest.uploadedById   !== req.user._id){
                throw new Error("Cannot update someone else's Request"); 
            }
            if(interest.status === "interested"){
                interest.status = 'ongoing' ; 
                interest.uploadedById = uploadedById ; 
                await interest.save() ; 
                return res.status(200).json({isSuccess: true , data: interest}) ; 
            }else{
                throw new Error("Can't Update Status to Ongoing") ; 
            }
        }
        if( bookInterestId && status !== 'ongoing' && validBook.uploadedById.equals (req.user._id)){
            // console.log(validBook._id  , req.user.id) ; 
            throw new Error("Book Uploaded By Yourself!") ; 
        }
        const validBookInterest = await BookInterest.find({
            bookId: bookId, 
            interestedById: req.user._id, 
            status: { $in: ["interested", "ongoing", "success"] }
        });
        if(  validBookInterest.length > 0 && ["interested" , "ongoing" , "success"].includes(validBookInterest.status) )
            throw new Error("You have already shown interest in this book") ; 
        let data = [] ; 
      if(status !== "interested"){

      } else{
        const newBookInterest = new BookInterest({
            bookId , status: "interested" , interestedById: req.user._id , initialMessage: message , uploadedById
        }) ; 
        data = await newBookInterest.save() ; 
      }
        return res.status(200).json({isSuccess: true , data}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
} ) ; 

bookInterestRouter.post("/bookInterest1/:status/:bookId" , userAuth , async (req , res) => {
    try{
        const allowedStatus = ["interested" , "ongoing" , "success" , "delete"] ;
        const {status , bookId} = req.params ; 
        const { bookInterestId , initialMessage } = req.body ; 
        if( !status || !bookInterestId || !allowedStatus.includes(status)){
            throw new Error("Invalid URL") ; 
        }
        if(status === "interested" && !bookInterestId){
            const bookInterest = new BookInterest({
                bookId , status: "interested" , interestedById: req.user._id , initialMessage , 
            }) ; 
        } if( (status === "interested" && bookInterestId) || (!bookInterestId && status ) )
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

bookInterestRouter.get("/bookInterest/interestsReceived" , userAuth , async (req , res) => {
    try{
        // const requestsReceived = await BookInterest.find( {_} ) ; 
        const bookInterests =await BookInterest.aggregate([
            {
                $lookup: {
                    from: "books", // Book collection
                    localField: "bookId",
                    foreignField: "_id",
                    as: "bookDetails"
                }
            },
            { $unwind: "$bookDetails" }, // Convert array to object
            {
                $match: { "bookDetails.uploadedById": req.user._id,
                    "status": "interested" } // Filter by uploadedById
            },
            {
                $lookup: {
                    from: "users", // User collection
                    localField: "interestedById",
                    foreignField: "_id",
                    as: "interestedBy"
                }
            },
            { $unwind: "$interestedBy" } // Convert array to object
        ]);
        
        
    return res.status(200).json({isSuccess: true , data: bookInterests}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message }) ; 
    }
}) ; 

bookInterestRouter.get('/bookInterest/getAllInterests' , userAuth , async (req , res) => {
    try{
        // const books = await BookInterest.find().populate("bookId").populate("uploadedById") ; 
        // const books = await BookInterest.find().populate({
        //     path: "bookId",
        //     populate: { path: "uploadedById" , match: { _id : req.user._id } }
        // }) ; 
        const books = await BookInterest.find()
    .populate([
        {
            path: "bookId",
            populate: {
                path: "uploadedById",
                match: { _id: req.user._id } // Filters uploadedById
            }
        },
        { path: "interestedById" } // Populates interestedById separately
    ]);

        

        return res.status(200).json({isSuccess: true , data: books}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookInterestRouter.get("/bookInterest/acceptedPeople" , userAuth , async (req , res) => {
    try{
        const acceptedRequests = await BookInterest.find({status: "ongoing"})  .populate([
            {
                path: "bookId",
                populate: {
                    path: "uploadedById",
                    match: { _id: req.user._id } // Filters uploadedById
                }
            },
            { path: "interestedById" } // Populates interestedById separately
        ]); ;  
        return res.status(200).json({isSuccess: true , data: acceptedRequests}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 
   

module.exports = bookInterestRouter ; 