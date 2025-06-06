const socket = require("socket.io") ; 
const Chat = require("../database/Chat") ; 

const initializeSocket = (server) => {
    
    const io = socket( server , {
        cors: {
            origin: ["http://localhost:5173" , "https://book-worm-frontend.vercel.app"] ,
        }
    }) ;    

    io.on("connection" , (socket) => {
        socket.on("joinChat" , ({  userId , targetUserId , firstName}) => {
            const roomId = [userId , targetUserId].sort().join('_') ; 
            console.log(targetUserId , userId , firstName + " joined " ,roomId) ; 
            socket.join(roomId) ;
        }) ; 

        socket.on("sendMessage" , async ( {firstName , lastName , userId , targetUserId , newMessage , _id} ) => {
            console.log("send message event name: ",firstName , " + userId: " , userId , " + targetUserId: " , targetUserId , " newMessage: + " , newMessage ) ; 
            const roomId = [userId , targetUserId].sort().join('_') ; 
            console.log(firstName + " says ", newMessage) ; 
            try{
                let chat = await Chat.findOne({
                    participants: { $all: [userId , targetUserId]  }
                }) ; 
                if(!chat){
                    chat = new Chat({
                        participants: [userId , targetUserId] , 
                        messages: [], 
                    }) ; 
                } chat.messages.push({
                    senderId: userId , message: newMessage
                }) ; 
                const response = await chat.save() ; 
                // console.log("chatting response: " , response) ; 
                console.log("object that we are sending 37 " , firstName , newMessage , _id)
                io.to(roomId).emit("messageReceived" , {firstName , lastName , newMessage , _id}) ; 
            } catch(Error){
                console.log("Error is: " , Error.message) ; 
            }
            
        }  ) ; 

        socket.on("sendMessage1" , () => {}) ; 

        socket.on("disconnect" , () => {}) ; 
    })

}

module.exports = initializeSocket ; 