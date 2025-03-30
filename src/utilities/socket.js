const socket = require("socket.io") ; 


const initializeSocket = (server) => {
    
    const io = socket( server , {
        cors: {
            origin: "http://localhost:5173"
        }
    }) ;    

    io.on("connection" , (socket) => {
        socket.on("joinChat" , ({  userId , targetUserId}) => {
            const roomId = [userId , targetUserId].sort().join('_') ; 
            console.log(targetUserId , userId) ; 
            socket.join(roomId) ;
        }) ; 

        socket.on("sendMessage" , ( {name , userId , targetUserId , newMessage} ) => {
            const roomId = [userId , targetUserId].sort().join('_') ; 
            io.to(roomId).emit("messageReceived" , {name , newMessage}) ; 
        }  ) ; 

        socket.on("sendMessage" , () => {}) ; 

        socket.on("disconnect" , () => {}) ; 
    })

}

module.exports = initializeSocket ; 