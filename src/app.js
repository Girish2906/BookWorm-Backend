const express = require("express") ; 
const app = express() ; 
const connectDB = require("./database/connection") ; 
const cookieParser = require("cookie-parser") ;
const multer = require("multer") ; 
require('dotenv').config({ path: './src/.env' });
const authRouter = require("./routes/auth") ; 
const bookRouter = require("./routes/book") ; 
const bookInterestRouter = require("./routes/bookInterests") ; 
const chatRouter = require("./routes/chat") ; 
const http = require("http") ; 
const cors = require("cors") ; 
const initializeSocket = require("./utilities/socket") ;
const upload = multer({ dest: 'uploads/' }) ; 
app.use(cors({
    origin: "http://localhost:5173" , 
    credentials: true
})) ; 
app.use(express.urlencoded({ extended: false })) ;
app.use(cookieParser()) ; 
app.use(express.json()) ; 
app.use("/" , authRouter) ; 
app.use("/" , bookRouter) ; 
app.use("/" , bookInterestRouter) ; 
app.use("/" , chatRouter) ; 

const server = http.createServer(app) ; 
initializeSocket(server) ;



connectDB().then(() => {
    console.log("Connected to the Database") ; 
    server.listen(3000 , () => {
        console.log("Server is running on port 3000") ; 
    } )
}).catch(() => {
    console.log("Cannot Connect to the Database") ; 
})