import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

import messageRoutes from './routes/messageRoutes'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import WebSocketServerSetUp from './websocket';


mongoose.connect(process.env.MONGO_CONNECTION_STRING || "");

const app = express();

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/uploads', express.static(__dirname + '/uploads'))
app.use(express.json());
app.use(cookieParser());

app.get('/test', (req: Request, res: Response) => {
  res.json('test ok');
});

app.use('/auth', authRoutes)
app.use('/messages', messageRoutes)
app.use('/user', userRoutes)

const port:number = 4000; // You can specify your desired port
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
WebSocketServerSetUp(server)

