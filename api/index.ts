import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import UserModel, { IUser } from './models/User'; // Make sure to replace 'User' with the actual model file and interface

dotenv.config();

mongoose.connect(process.env.MONGO_CONNECTION_STRING || "");

const app = express();
const jwtSecret = process.env.JWT_SECRET || '';

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use(express.json());
app.use(cookieParser());
const salt = bcrypt.genSaltSync(10);


app.get('/test', (req: Request, res: Response) => {
  res.json('test ok');
});

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const hashPassword = bcrypt.hashSync(password, salt)
    const createdUser: IUser = await UserModel.create({ 
      username: username, 
      password: hashPassword
    });

    jwt.sign({ userId: createdUser._id, username }, jwtSecret, (err:any, token:string | undefined) => {
      if (err) throw err;
      res.cookie('token', token, {sameSite:'none', secure:true}).status(201).json({
        _id: createdUser._id,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal Server Error');
  }
});

app.post('/login', async (req: Request, res: Response) =>{
  const {username, password} = req.body;
  const foundUser = await UserModel.findOne({username});
  if(foundUser){
    const isPassCorrect = bcrypt.compareSync(password, foundUser.password);
    if(isPassCorrect){
      jwt.sign({ userId: foundUser._id, username }, jwtSecret, {}, (err, token) =>{
        res.cookie('token', token, {sameSite: 'none', secure:true}).json({
          id: foundUser._id
        })
      })
    }
  }
})

app.get('/profile',(req: Request, res: Response) => {
  const {cookies} = req;
  if(cookies && cookies.token){
    jwt.verify(cookies.token, jwtSecret, {}, (err: jwt.VerifyErrors | null, userdata: string | jwt.JwtPayload | undefined) =>{
      if(err) throw err;
      res.json(userdata)
    })
  }else{
    res.status(401).json('No Token');
  }

});

const port = 4000; // You can specify your desired port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
