const express = require("express") ; 
const bookRouter = express.Router() ; 
const userAuth = require("../middlewares/userAuth") ; 

bookRouter.post("/upload" , userAuth , async (req , res) => {
    try{
        
    } catch(Error){
        return res.status(400).json({isSuccess: false , data: Error.message}) ; 
    }
}) ; 

module.exports = bookRouter ; 