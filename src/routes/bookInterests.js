const express = require('express') ; 
const bookInterestRouter = express.Router() ; 
const {userAuth} = require("../middlewares/userAuth") ; 
const BookInterest = require("../database/BookInterest") ; 
const User = require("../database/User") ; 
const Book = require("../database/book") ; 
const book = require('../database/book');

const checkUpdateValid = async (bookId , _id) => {
    const isValidUpdate = await Book.findOne({_id: bookId , uploadedById: _id}) ; 
    return Object.keys(isValidUpdate).length ; 
} ; 

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
        // console.log(bookInterestId) ; 
        const interestedById = req.user._id ; 
        if( !status || !bookId || !allowedStatus.includes(status) || (status !== "interested" && status !== "delete" && !bookInterestId) ){
            throw new Error("Invalid Request") ; 
        } 
        const validBook = await Book.findOne({_id: bookId}) ; 
        if(!validBook){
            throw new Error("Book Not Found") ; 
        }
        const uploadedById = validBook.uploadedById ;
        if( (status === "interested" && bookInterestId) || (!bookInterestId && status !== "interested" ) ){
            throw new Error("Invalid Request") ; 
        } else if(status === "interested"){
            if(req.user._id.equals(uploadedById)){
                throw new Error("Book Uploaded By Yourself!") ;
            }
            const duplicateRequest = await BookInterest.find({bookId , interestedById}) ; 
            if(duplicateRequest.length > 0){ throw new Error("You have already shown interest in this book") }
            const bookInterest = new BookInterest({
                bookId , status , interestedById , initialMessage , uploadedById
            }) ; 
            const data = await bookInterest.save() ; 
            return res.status(200).json({isSuccess: true , data}) ; 
        }
        else if(status === "ongoing" || status === "success"){
            const duplicateRequest = await BookInterest.findOne({_id: bookInterestId , status }) ;
            if(duplicateRequest) {
                throw new Error("Duplicate Request")
            }
            const interestedRequest = await BookInterest.findOne({_id: bookInterestId , status: status === "ongoing" ? "interested" : "ongoing" }) ; 
            const isUpdateValid = checkUpdateValid(interestedRequest.bookId , req.user._id) ; 
            if(!isUpdateValid){
                throw new Error("Inavlid Update") ; 
            }
            interestedRequest.status = status ; 
            const data = await interestedRequest.save() ;   
            return res.status(200).json({isSuccess: true , data}) ; 
        } else if(status === "delete"){
            const interestedRequest = await BookInterest.findOne({bookId , interestedById , status: "interested"}) ; 
            if(!interestedRequest){
                throw new Error("You Have Not Expressed Interest In This Book Ever") ; 
            } 
            const isUpdateValid = checkUpdateValid(bookId , req.user._id) ; 
            if(!isUpdateValid){
                throw new Error("Invalid Update 121") ; 
            }
            const data = await BookInterest.findOneAndDelete({_id: interestedRequest._id}) ; 
            return res.status(200).json({isSuccess: true , data  }) ; 
        }
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
        console.log("duplicate ",duplicateRequest) ; 
        res.send(duplicateRequest) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

bookInterestRouter.get("/bookInterest/interestsReceived/:status" , userAuth , async (req , res) => {
    try{
        const {status} = req.params ; 
       const bookInterestsReceived = await BookInterest.aggregate(
       [ 
        {
        $match: {
            status: status , 
            uploadedById: req.user._id
        }
        } , 
    ]
    ) ; 
    return res.status(200).json({isSuccess: true , data: bookInterestsReceived}) ; 
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
        const acceptedRequests = await BookInterest.aggregate([
            {
                $match: {
                    status: "ongoing", 
                    $or: [
                        {"interestedById": req.user._id} , 
                        {"uploadedById": req.user._id} , 
                    ]
                }
            } , 
            {
                $lookup: {
                    from: "users", 
                    localField: "interestedById", 
                    foreignField: "_id",
                    as: "interestedBy"
                }
            } , { $unwind: "$interestedBy" },
            {
                $lookup: {
                    from: "users", 
                    localField: "uploadedById", 
                    foreignField: "_id",
                    as: "uploadedBy"
                }
            } , { $unwind: "$uploadedBy" } , 
            {
                $project: {
                    chatPerson: {
                        $cond: { 
                            if: { $eq: ["$interestedBy._id", req.user._id] }, 
                            then: "$uploadedBy",   // If `interestedBy._id === req.user._id`, keep `uploadedBy`
                            else: "$interestedBy"  // Otherwise, keep `interestedBy`
                        }
                    },
                    status: 1,  
                    bookId: 1
                }
            }
        ]) ; 
        // const acceptedRequests = await BookInterest.aggregate([
        //     {
        //         $match: {
        //             status : "ongoing" , 
        //         }
        //     } , 
        //     {
        //         $lookup: {
        //             from : "books" , 
        //             localField: "bookId" , 
        //             foreignField: "_id",
        //             as: "bookDocument" , 
        //         }
        //     } , 
        //     { $unwind: "$bookDocument" },
        //     {
        //         $lookup: {
        //             from: "users" , 
        //             localField: "interestedById", 
        //             foreignField: "_id" , 
        //             as: "interestedPerson" , 
        //         }
        //     } , 
        //     { $unwind: "$interestedPerson" },
        //     {
        //         $match: {
        //             $or: [
        //                 {  "interestedPerson._id" : req.user._id } , 
        //                 {  "bookDocument.uploadedById" : req.user._id}

        //             ]
        //         }
        //     }
        //     // {
        //     //     $match: {
        //     //         $or: [
        //     //             {"interestedPerson._id": req.user._id} , 
        //     //             {"bookInterest.uploadedById": req.user._id} 
        //     //         ]
        //     //     }
        //     // }
        // ]) ; 
        // const acceptedRequests = await BookInterest.aggregate([
        //     {
        //         $lookup: {
        //           from: "books" , 
        //           localField: "bookId" , 
        //           foreignField: "_id" , 
        //           as: "bookInterested"
        //         }
        //         } , 
        //       {
        //         $addFields: {
        //           bookInterested: {
        //              $arrayElemAt: ["$bookInterested" , 0]
        //           }
        //         }
        //       },
        //       {
        //         $match: {
        //             $and: [
        //                 {
        //                     $or: [
        //                         {"bookInterested.uploadedById": req.user._id } , 
        //                         {interestedById: req.user._id}
        //                       ] 
        //                 } , 
        //                 {
        //                     status: "ongoing"
        //                 }
        //             ]
        //         }
        //       }
        // ]) ; 
        // const acceptedRequests = await BookInterest.find({status: "ongoing"})  .populate([
        //     {
        //         path: "bookId",
        //         populate: {
        //             path: "uploadedById",
        //             match: { _id: req.user._id } 
        //         }
        //     },
        //     { path: "interestedById" } 
        // ]); ;  
        console.log(req.user._id) ; 
        return res.status(200).json({isSuccess: true , data: acceptedRequests}) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 
   

module.exports = bookInterestRouter ; 