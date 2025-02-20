const express = require("express") ; 
const app = express() ; 
const connectDB = require("./database/connection") ; 
const cookieParser = require("cookie-parser") ;
require('dotenv').config({ path: './src/.env' });
const authRouter = require("./routes/auth") ; 
app.use(cookieParser()) ; 
app.use(express.json()) ; 
app.use("/" , authRouter) ; 
connectDB().then(() => {
    console.log("Connected to the Database") ; 
    app.listen(3000 , () => {
        console.log("Server is running on port 3000") ; 
    } )
}).catch(() => {
    console.log("Cannot Connect to the Database") ; 
})