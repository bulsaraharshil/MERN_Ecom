var mongoose = require('mongoose');
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');

var userSchema = new mongoose.Schema({
  name:{
      type:String,
      required: true,
      maxlength: 32,
      trim: true
  }, 
  lastname:{
    type:String,
    maxlength: 32,
    trim: true
  },
  email:{
      type:String,
      trim:true,
      required:true,
      unique:true
  },
  userinfo:{
      type:String,
      trim:true
  },
  encry_password:{  //encrypted password is created and stored in DB
    type:String,
    required:true
  },
  salt:String,
  role:{
      type:Number,
      default:0
  },
  purchases:{
      type:Array,
      default:[]
  }
  
}, {timestamps:true} );

//creating virtual fields

userSchema.virtual("password")	//here password is a virtual field
    .set(function(password){
        this._password=password   	
        this.salt=uuidv1();
        this.encry_password=this.securePassword(password);
    })
    .get(function(){
        return this._password
    })



userSchema.methods = {
    authenticate:function(plainpassword){	//authenticate is a function
        return this.securePassword(plainpassword) === this.encry_password
    },

    securePassword:function(plainpassword){             //declaring a method named securePassword, this function will return encrypted password
        if (!plainpassword) return "";		//// here empty ""  is passed so that mongoose generates a error and it is inbuilt functionality that when empty "" is passed mongoose generates error
        try{
            return crypto.createHmac('sha256', this.salt)   	//using crypto to encrypt the password
            .update(plainpassword)
            .digest('hex');
        }catch(error){
            return "";
        }
    }
}

module.exports = mongoose.model("User",userSchema)