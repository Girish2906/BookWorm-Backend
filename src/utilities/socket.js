const socket = require("socket.io") ; 


const initializeSocket = (server) => {
    
    const io = socket( server , {
        cors: {
            origin: "http://localhost:5173"
        }
    }) ;    

    io.on("connection" , (socket) => {
        socket.on("joinChat" , ({  userId , targetUserId , firstName}) => {
            const roomId = [userId , targetUserId].sort().join('_') ; 
            console.log(targetUserId , userId , firstName + " joined " ,roomId) ; 
            socket.join(roomId) ;
        }) ; 

        socket.on("sendMessage" , ( {firstName , userId , targetUserId , newMessage , _id} ) => {
            // console.log("send message event name: ",name , " + userId: " , userId , " + targetUserId: " , targetUserId , " newMessage: + " , newMessage ) ; 
            const roomId = [userId , targetUserId].sort().join('_') ; 
            console.log(firstName + " says ", newMessage);
            
            io.to(roomId).emit("messageReceived" , {firstName , newMessage , _id}) ; 
        }  ) ; 

        socket.on("sendMessage1" , () => {}) ; 

        socket.on("disconnect" , () => {}) ; 
    })

}

module.exports = initializeSocket ; 