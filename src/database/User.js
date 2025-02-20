const mongoose = require("mongoose") ;  
const validator = require("validator") ; 
const jwt = require("jsonwebtoken") ; 
const   userSchema = mongoose.Schema({
    firstName: {
        type: String , 
        required: true , 
        validate: {
            validator: function(v){
                if(v.length < 3){
                    throw new Error("First name must be at least 3 characters long") ;
                }
                const regex = /^[A-Za-z]{1,50}$/; 
                if(! regex.test(v)){
                    throw new Error("First name must contain only letters") ;
                }
            }
        } , 
    } , 
    lastName: {
        type: String , 
        validate: {
            validator: function(v){
                if(v.length < 3){
                    throw new Error("Last name must be at least 3 characters long!") ;
                }
                const regex = /^[A-Za-z]{1,50}$/; 

                if(! regex.test(v)){
                    throw new Error("Last name must contain only letters!") ;
                }
            }
        } , 
    } , 
    email: {
        type: String , 
        required: true , 
        unique: true , 
        validate: {
            validator: function(v){
                if(! validator.isEmail(v))
                    throw new Error("Email is not valid!") ; 
            }
        }
    } , 
    password: {
        type: String , 
        required: true , 
        validate: {
            validator: function(v){
                if(! validator.isStrongPassword(v)){
                    // console.log("password is not strong") ;
                    throw new Error("Please Enter Strong Password!") ;
                } 
            }
        }
    } , 
    phoneNumber: {
        type: String , 
        unique: true ,
        required: false ,
        validate: {
            validator: function(v){
                if(!v) return true ; 
                if (v && !validator.isMobilePhone(v)){
                    throw new Error("Please Enter Valid Phone Number!") ;
                }
            }
        } 
    }
}) ; 



userSchema.index({ phoneNumber: 1 }, { unique: true, partialFilterExpression: { phoneNumber: { $exists: true, $ne: "" } } });

module.exports = mongoose.model("User" , userSchema) ; 
