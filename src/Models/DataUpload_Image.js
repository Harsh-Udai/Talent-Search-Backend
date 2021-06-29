const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    owner:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required: true,
    },
    ContentLabel:{
        type:String,
        required: true,
    },
    ContentDescription:{
        type: String,
        required: true,
    },
    URL:{
        type:String,
        required:true
    },
    id:{
        type:String,
        required:true
    },
    likes:{
        type: Number,
        default: 0   
    },
    likes_arr:[
        {
            type: String
        }
    ]
},{
    timestamps:true, 
})


const Data = mongoose.model('DataUpload_image',userSchema)
module.exports = Data;