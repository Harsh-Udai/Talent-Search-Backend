const jwt = require('jsonwebtoken')
const User = require('../Models/user')

const auth = async(req,res,next)=>{
    try{
        // console.log("enteref")
        // console.log(req.headers);
        const token = req.headers.authorization.replace('Bearer ','')
        // console.log(token);
        const decoded = jwt.verify(token,process.env.JWT_TOKEN)
        // console.log("decoded",decoded);
        const user = await User.findOne({_id: decoded._id, 'tokens.token':token})
        // console.log(user);
        if(!user){
            throw new Error('token not found')
        }
        req.token = token
        req.user = user
        next()
    }  catch(e){
        res.status(400).send({error: "Please authenticate"})
    }
}

module.exports = auth

