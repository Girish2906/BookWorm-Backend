const validator = require("validator") ; 
const validateUserData = (body) => {
    const {firstName , lastName , email , password} = body ; 
    // console.log(firstName , lastName , email , password);
    
    if(!firstName){
        throw  new Error("Firstname is required") ; 
    } if(!lastName){
        throw new Error( "Lastname is required") ; 
    } if(!email){
        throw new Error( "Email is required") ; 
    } if(!password){
        console.log("password check" , !password) ; 
        throw new Error( "Password is required") ; 
    } if(!validator.isStrongPassword(password)){
        throw new Error("Please Enter Strong Password!") ; 
    }
    return true ; 
} ; 

const validateLoginData = (body) => {
    const {email , password} = body ; 
    if(!email){
        throw new Error("Email is required") ; 
    } if(!password){
        throw new Error("Password is required") ; 
    }
    return true ; 
} ; 

const validateBookUploadData = (body) => {
    const {name , author , pages , genre} = body.body ; 
    console.log(name , author, genre , pages) ; 
    if(!name || !author || !pages || !genre.length  ){
        throw new Error("All fields are mandatory") ; 
    }
} ; 

module.exports = {validateUserData , validateLoginData , validateBookUploadData } ; 