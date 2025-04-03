const express = require('express') ;
const chatRouter = express.Router() ; 
const {userAuth} = require("../middlewares/userAuth") ; 
const Chat = require("../database/Chat") ; 

chatRouter.get("/chat/:targetUserId" , userAuth , async (req , res) => {
    try{
        const {targetUserId} = req.params ; 
        const userId = req.user._id ; 
        let chat = await Chat.findOne({
            participants: {
                $all: [userId , targetUserId] 
            }
        }).populate({
            path: "messages.senderId" , 
            select: "firstName lastName"
        }
            // "messages.senderId" , "firstName lastName"
        )
        if(! chat){
            const chat = new Chat({
                participants: [userId , targetUserId] , 
                messages: [], 
            }) ; 
            await chat.save() ; 
        }
        return res.status(200).json({isSuccess: true , data: chat }) ; 
    } catch(Error){
        return res.status(400).json({isSuccess: false , message: Error.message}) ; 
    }
}) ; 

module.exports = chatRouter ; 