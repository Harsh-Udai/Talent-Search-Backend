const express = require('express');
const Router = new express.Router();
const User = require('../Models/user');
const multer = require('multer');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const DataImage = require('../Models/DataUpload_Image');
const DataScript = require('../Models/DataUpload_Script');
const DataVideo = require('../Models/DataUpload_Video');
const auth = require('../Middleware/auth');



const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('tspproject.s3-accelerate.amazonaws.com'),
    useAccelerateEndpoint: true,
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
})

const storage = multer.memoryStorage({
    destination: function(req, file, callback) {
        callback(null, '')
    }
})

const upload = multer({storage}).single('image')
const upload_PDF = multer({storage})
const upload_VID = multer({storage})

Router.post('/ImageUpload',auth,upload,(req,res)=>{
    console.log("middleware passed")
    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length -1]
    const params = {
        // AccelerateConfiguration: {
        //     Status: "Enabled"
        // },
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer,
        Extra: req.body
    }
    s3.upload(params,async(error,data)=>{
        if(error){
            res.status(500).send(error);
        }
        else{
            console.log("entered");
            const newImage = new DataImage({
                owner: req.body.owner,
                email: req.body.email,
                ContentLabel: req.body.ContentLabel,
                ContentDescription: req.body.ContentDescription,
                URL: data.Location,
                id: uuidv4()
            })
            await newImage.save();
            res.status(200).send(data);
        }        
    })
})

Router.post('/ScriptUpload',auth,upload_PDF.single("file"),(req,res)=>{
    let myFile = req.file.originalname.split(".")
    const fileType = myFile[myFile.length -1]
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.file.buffer,
        Extra: req.body
    }
    s3.upload(params,async(error,data)=>{
        if(error){
            res.status(500).send(error);
        }
        else{
            const newScript = new DataScript({
                owner: req.body.owner,
                email: req.body.email,
                ContentLabel: req.body.ContentLabel,
                ContentDescription: req.body.ContentDescription,
                URL: data.Location,
                id: uuidv4()
            })
            await newScript.save();
            res.status(200).send(data);
        }
    })
})

Router.post('/VideoUpload',auth,upload_VID.any('video'),(req,res)=>{
    console.log("entered");

    let myFile = req.files[0].originalname.split(".")
    const fileType = myFile[myFile.length -1]
    let myFile_Img = req.files[1].originalname.split(".")
    const fileType_Img = myFile_Img[myFile_Img.length -1]
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType}`,
        Body: req.files[0].buffer
    }
    const params_Img = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}.${fileType_Img}`,
        Body: req.files[1].buffer,
    }
    s3.upload(params,async(error,data)=>{
        if(error){
            res.status(500).send(error);
        }
        else{
            console.log("Video Done")
            s3.upload(params_Img,async(error,data_Img)=>{
                if(error){
                    res.status(500).send(error);
                }
                else{
                    const newScript = new DataVideo({
                        owner: req.body.owner,
                        email: req.body.email,
                        ContentLabel: req.body.ContentLabel,
                        ContentDescription: req.body.ContentDescription,
                        URL: data.Location,
                        URL_Image: data_Img.Location,
                        id: uuidv4()
                    })
                    await newScript.save();
                    res.status(200).send(data);
                }
            })
        }
    })
})

Router.get('/getImages',auth,async(req,res)=>{
    // console.log("routed checkd");
    const email = req.query.email;
    try{
        const data = await DataImage.find({email});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/getScripts',auth,async(req,res)=>{
    const email = req.query.email;
    try{
        const data = await DataScript.find({email});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/getVideos',auth,async(req,res)=>{
    const email = req.query.email;
    try{
        const data = await DataVideo.find({email});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/getBio',auth,async(req,res)=>{
    const email = req.query.email;
    try{
        const data = await User.find({Email:email});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/Images',auth,async(req,res)=>{
    try{
        const data = await DataImage.find({});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/Scripts',auth,async(req,res)=>{
    try{
        const data = await DataScript.find({});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.get('/Videos',auth,async(req,res)=>{
    try{
        const data = await DataVideo.find({});
        res.send(data);
    }
    catch(e){
        res.status(500).send(e)
    }
})

Router.post('/ScriptLikes',auth,async(req,res)=>{
    try{
        const data = await DataScript.find({id: req.body.id});
        const val = data[0].likes_arr.includes(req.body.email);
        if(val===false){
            data[0].likes +=1;
            data[0].likes_arr.push(req.body.email);
            await data[0].save();
            res.send({likes:data[0].likes});
        }
        else{
            data[0].likes -=1;
            const newAr = data[0].likes_arr.filter((data)=>{
                return data!=req.body.email;
            })
            data[0].likes_arr = newAr;
            await data[0].save();
            res.send({likes:data[0].likes});
        }
    }
    catch(e){
        res.status.send(e);
    }
})

Router.post('/ImagesLikes',auth,async(req,res)=>{
    try{
        const data = await DataImage.find({id: req.body.id});
        const val = data[0].likes_arr.includes(req.body.email);
        if(val===false){
            data[0].likes +=1;
            data[0].likes_arr.push(req.body.email);
            await data[0].save();
            res.send({likes:data[0].likes});
        }
        else{
            data[0].likes -=1;
            const newAr = data[0].likes_arr.filter((data)=>{
                return data!=req.body.email;
            })
            data[0].likes_arr = newAr;
            await data[0].save();
            res.send({likes:data[0].likes});
        }
    }
    catch(e){
        res.status(400).send(e);
    }
})

Router.post('/VideosLikes',auth,async(req,res)=>{
    try{
        const data = await DataVideo.find({id: req.body.id});
        const val = data[0].likes_arr.includes(req.body.email);
        if(val===false){
            data[0].likes +=1;
            data[0].likes_arr.push(req.body.email);
            await data[0].save();
            res.send({likes:data[0].likes});
        }
        else{
            data[0].likes -=1;
            const newAr = data[0].likes_arr.filter((data)=>{
                return data!=req.body.email;
            })
            data[0].likes_arr = newAr;
            await data[0].save();
            res.send({likes:data[0].likes});
        }
    }
    catch(e){
        res.status(400).send(e);
    }
})

Router.post('/VideosViews',auth,async(req,res)=>{
    try{
        const data = await DataVideo.find({id: req.body.id});
        const val = data[0].views_arr.includes(req.body.email);
        if(val===false){
            data[0].views +=1;
            data[0].views_arr.push(req.body.email);
            await data[0].save();
            res.send();
        }
    }
    catch(e){
        res.status(400).send(e);
    }
})

Router.delete('/ImageDelete',auth,async(req,res)=>{
    console.log(req.body);
    try{

        // const data = await DataImage.find({id:req.body.id})
        const data = await DataImage.deleteOne({id:req.body.id})
        res.send({msg:'done'});

    }
    catch(e){
        res.status(500).send(e);
    }
})

Router.delete('/VideoDelete',auth,async(req,res)=>{
    console.log(req.body);
    try{

        // const data = await DataImage.find({id:req.body.id})
        const data = await DataVideo.deleteOne({id:req.body.id})
        res.send({msg:'done'});

    }
    catch(e){
        res.status(500).send(e);
    }
})

Router.delete('/VideoDelete',auth,async(req,res)=>{
    console.log(req.body);
    try{

        // const data = await DataImage.find({id:req.body.id})
        const data = await DataVideo.deleteOne({id:req.body.id})
        res.send({msg:'done'});

    }
    catch(e){
        res.status(500).send(e);
    }
})

Router.delete('/ScriptDelete',auth,async(req,res)=>{
    console.log(req.body);
    try{

        // const data = await DataImage.find({id:req.body.id})
        const data = await DataScript.deleteOne({id:req.body.id})
        res.send({msg:'done'}); 

    }
    catch(e){
        res.status(500).send(e);
    }
})

 
module.exports = Router;