const  mongoose = require('mongoose') ; 
const validator = require('validator') ; 
const userSchema2 = mongoose.Schema({
    firstName: {
        type: String , 
        required: true  , 
        validate: {
            validator: function(v){
                if(v.length < 3){
                    throw new Error("First Name must be at least 3 characters long") ;
                }
                for(let i = 0 ; i < v.length ; ++i){
                    if(v[i] >= 48 && v[i] <= 57){
                        throw new Error("First Name must contain only letters") ;
                    }
                }
            }
        }
    } , 
    email: {
        type: String , 
        required: true , 
        validate: {
            validator: function(v){
                if( ! validator.isEmail(v)){
                    throw new Error("Email is not valid!") ; 
                }
            }
        }
    } , 
    password: {
        type: String , 
        required: true , 
        validate: {
            validator: function(v){
                if(! validator.isStrongPassword(v)){
                    throw new Error("Please Enter Strong Passwrord!") ; 
                }
            }
        }
    }
}) ; 

module.exports =  mongoose.model("User2" , userSchema2) ; 