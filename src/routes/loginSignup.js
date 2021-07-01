const express = require('express');
const Router = new express.Router();
const User = require('../Models/user');
const{sendWelcomeEmail,cancelEmail,securityM} = require('../email/account')
// const {sendWelcomeEmail,securityM}  = require('../email/account1');
const otpGen = require('otp-generator')

// Hello World Router
Router.get('/',(req,res)=>{
    res.send("Hello World!");
})

Router.post('/Signup/email',async(req,res)=>{
    try{
        const checkUp = await User.find({Email: req.body.Email});
        const checkUp1 = await User.find({Email: req.body.Email.toLowerCase()})

        if(checkUp.length===0 && checkUp1.length===0){
            const otp = otpGen.generate(6,{upperCase:false,alphabets:false});
            sendWelcomeEmail(req.body.Email,'');
            securityM(req.body.Email,otp);
            res.send({msg:'NO',otp: otp});
        }
        else{
            res.send({msg:'Already'});
        }
    }
    catch(e){
        res.status(400).send(e)
    }
})

Router.post('/Signup/create',async (req,res)=>{
    const user = new User(req.body)   // Data recieve from the request
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.status(200).send({msg:'Done'});
    } catch(e){
        res.status(400).send(e)
    }
})

Router.post('/Login',async(req,res)=>{
    try{
        const Email = req.body.Email;
        const Password = req.body.Password;
        const user  = await User.findByCredentials(Email,Password)
        res.status(200).send(user)
    }
    catch(e){
        res.status(200).send({msg:'NO'})
    }
})

Router.post('/Reset/email',async(req,res)=>{
    try{
        const checkUp = await User.find({Email: req.body.Email});
        if(checkUp.length===0){
            res.send({msg:'NO'});
        }
        else{
            const otp = otpGen.generate(6,{upperCase:false,alphabets:false});
            //sendWelcomeEmail(req.body.email,'');
            securityM(req.body.Email,otp);
            res.send({msg: otp});
        }
    }
    catch(e){
        res.status(400).send(e)
    }
})

Router.post('/Reset/update',async(req, res)=>{
    try{
        const checkUp = await User.find({Email: req.body.Email});
        checkUp[0].Password =  (req.body.Password)
        await checkUp[0].save();
        res.send({msg:'Done'})
    }
    catch(e){
        res.send("error")
    }   
})

module.exports = Router;