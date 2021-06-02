const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    Name:{
        type:String,
        required:true,
        trim: true,
    },
    Email:{
        type:String,
        unique: true,
        required:true,
    },
    Password:{
        type:String,
        required:true
    },
    Bio:{
        type:String,
        required:true
    },
    init_token:{
        type: String,
    },
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }],
},{
    timestamps:true, 
})

userSchema.methods.generateAuthToken = async function(){
    const user  = this
    //console.log(user)
    
    const token = jwt.sign({_id: user._id.toString()},'resourceManagementApp')
    //console.log(token);
    
    user.init_token = token
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password)=>{

    const user  = await User.findOne({Email: email})
   
    if(!user){
        throw new Error('Unable to login /No User')
    }

    
    const isMatch = await bcrypt.compare(password,user.Password);
    

    if(!isMatch){
        throw new Error ('Unable to login /password issues')
    }

    return user

}


userSchema.pre('save',async function(next){
    const user = this
    
    if(user.isModified('Password')){
        user.Password = await bcrypt.hash(user.Password,8)
    }
    next()
})


const User = mongoose.model('User',userSchema)

module.exports = User;

