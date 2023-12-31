import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors'
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

app.get('/test', (req: Request, res: Response) => {
  res.json('test ok');
});

app.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const createdUser: IUser = await UserModel.create({ username, password });

    jwt.sign({ userId: createdUser._id }, jwtSecret, (err:any, token:string | undefined) => {
      if (err) throw err;
      res.cookie('token', token).status(201).json({
        _id: createdUser._id
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal Server Error');
  }
});

const port = 4000; // You can specify your desired port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
