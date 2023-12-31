const express = require('express');
const dotenv = require('dotenv');
const mongooose = require('mongoose');
const jst = require('jsonwebtoken');
const UserModel = require('./models/User');

dotenv.config();
mongooose.connect(process.env.MONGO_CONNECTION_STRING)
const app = express();
const jwtSecret = process.env.JWT_SECRET;
app.get('/test', (req, res) => {
    res.json('test ok');
})

app.post('/register', async (req,res) =>{
    const {username,password} = req.body;
    const createdUser = await UserModel.create({username,password});
    jst.sign({userId:createdUser, _id}, jwtSecret, (err,token) =>{
        if(err) throw err;
        res.cookie('token', token).status(201).json('ok');
    })
})

app.listen(4000);