import asyncHandler from "express-async-handler";
import User from "../models/user.js";
import { generateToken } from "../config/generateToken.js";
const userRegister = asyncHandler(async(req,res)=>{
    const { name, email, password, pic } = req.body;

    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExist = await User.findOne({email:email});
    if(userExist){
        res.status(400);
        throw new Error("User already exists");
    }

    const user = await User.create({
        name:name,email:email,password:password,pic:pic
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name:user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        });
    } else {
        res.status(400);
        throw new Error("Failed to Create the User");
    }
});

const userLogin = asyncHandler(async(req,res)=>{
    const {email,password} = req.body;
    const user = await User.findOne({email:email});

    if(user && (await user.matchPassword(password))){
        res.json({
            _id: user._id,
            name:user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }
})

const allUsers = asyncHandler(async(req,res)=>{
    const keyword = req.query.search ? {
        $or: [
            {name: {$regex : req.query.search,$options: "i"}},
            {email: {$regex: req.query.search,$options: "i"}}
        ]
    }:{}

    const users = await User.find(keyword).find({_id:{$ne: req.user._id}});
    res.send(users);
})

export  { userRegister, userLogin, allUsers } ;