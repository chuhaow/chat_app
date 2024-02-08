import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose, { connection } from 'mongoose';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import ws from 'ws';
import UserModel, { IUser } from './models/User'; // Make sure to replace 'User' with the actual model file and interface
import { IUserdata } from './interfaces/IUserdata';
import { IConnectionData } from './interfaces/IConnectionData';
import { IMessageData as IMessagePackage } from './interfaces/IMessageData';
import MessageModel from './models/Message';
import UniqueConnectionSet from './Helper/UniqueConnectionSet';
import fs from 'fs'
import * as crypto from 'crypto';
dotenv.config();

mongoose.connect(process.env.MONGO_CONNECTION_STRING || "");

const app = express();
const jwtSecret = process.env.JWT_SECRET || '';

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));
app.use('/uploads', express.static(__dirname + '/uploads'))
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

    try {
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
        if(error instanceof Error && (error as any).code === 11000){
          res.status(400).json({error: "Username already exists"})
        }else{
          throw error;
        }
    }


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
        if (err) throw err;
        res.cookie('token', token, {sameSite: 'none', secure:true}).json({
          id: foundUser._id
        })
      })
    }else{
      res.status(401).json({error: "Password is incorrect"})
    }
  }else{
    res.status(400).json({error: "User is not found"})
  }
})

app.post('/logout', (req:Request, res:Response) =>{
  res.cookie('token', '',{sameSite:'none', secure:true}).json('ok')
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

app.get('/messageHistory/:userId', async (req: Request, res: Response) =>{
  const {userId} = req.params;
  const userData: IUserdata = await getUserDataFromRequest(req);
  const myUserId: string = userData.userId;
  console.log("Selected chat: " + userId)
  console.log(myUserId)
  try {
    const messages = await MessageModel.find({
      sender:{$in:[userId, myUserId]},
      recipient:{$in:[userId, myUserId]}
    }).sort({createdAt:1})
    console.log(messages)
    res.json(messages)
    
  } catch (error) {
    res.status(500).json({error: error})
  }
})

app.get('/people', async (req: Request, res: Response) =>{
  const allUsers = await UserModel.find({}, {'_id':1,username:1});
  res.json(allUsers);
})

const port:number = 4000; // You can specify your desired port
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

async function getUserDataFromRequest(req:Request): Promise<IUserdata>{
  return new Promise( (resolve, reject) =>{
    const {cookies} = req;
    if(cookies && cookies.token){
      jwt.verify(cookies.token, jwtSecret, {}, (err: jwt.VerifyErrors | null, userdata: string | jwt.JwtPayload | undefined) =>{
        if(err) reject(err);

        resolve(userdata as IUserdata)
      })
    }else{
      reject("no token")
    }
  })
    
}

const wss = new ws.WebSocketServer({ server });
const activeConnections = new UniqueConnectionSet();
wss.on('connection', (connection: IConnectionData & WebSocket, req: Request) => {
  const cookies: string | undefined = req.headers.cookie;
  
  if (cookies) {
    const tokenString: string | undefined = cookies.split(';').find((str) => str.startsWith('token='));
    if (tokenString) {
      const token = tokenString.split('=')[1];
      if (token) {
        jwt.verify(token, jwtSecret, {}, (err: jwt.VerifyErrors | null, userdata: string | jwt.JwtPayload | undefined) => {
          if (err) throw err;
          if (userdata) {
            console.log('Setting user data');
            const { userId, username } = userdata as IUserdata;
            connection._id = userId;
            connection.username = username;
            activeConnections.add(connection);
          }
        });
      }
    }
  }

  connection.isAlive = true;

  const pingInterval = setInterval( () => {
    connection.send('ping')
    connection.deathTimer = setTimeout( () =>{
      connection.close();
      console.log("Dead")
      connection.isAlive = false;
    }, 1000)
  }, 5000)
 
  // Notify of connections
  broadcastOnlineStatus();

  connection.addEventListener('message', async (message: MessageEvent) => {
    const messageStr: string = message.data;

    if(messageStr === 'pong'){
      clearTimeout(connection.deathTimer);
    }else{
      try{
        const messageData: IMessagePackage = JSON.parse(message.data);
        let filename:string | null = null;
        
        if(messageData.file){
          const parts:string[] = messageData.file.info.split('.')
          const extension:string = parts[parts.length-1]
          const senderAndReceiverId = messageData.sender + messageData.recipient
          filename = senderAndReceiverId + '_'+ messageData.file.info
          const path: string = __dirname + '/Uploads/' + filename
          const fileData: string[] = (messageData.file.data as string).split(',')
          console.log(fileData[fileData.length-1]);
          const bufferData = Buffer.from(fileData[fileData.length-1],'base64');
          fs.promises.writeFile(path,bufferData)
          .then( () => {
            console.log('file saved: ' + path)
          })
          .catch( (error) =>{
            console.error('Error saving file:', error)
          })
          
        }
        console.log(messageData)
        if (messageData.recipient && (messageData.text || messageData.file)) {
          const messageDoc = await MessageModel.create({
            sender:connection._id,
            recipient: messageData.recipient,
            text: messageData.text,
            filename: messageData.file ? messageData.file.info : null
          });
    
          console.log("creating message")
          const recipientConnections = [...wss.clients].filter(
            (c) => (c as unknown as IConnectionData)._id === messageData.recipient || (c as unknown as IConnectionData)._id === messageData.sender
          );
    
          recipientConnections.forEach((c) => c.send(JSON.stringify({
            text: messageData.text,
            sender: connection._id,
            recipient: messageData.recipient,
            filename: messageData.file ? messageData.file.info : null,
            _id: messageDoc._id,
          })));

          console.log(Date.now())
        }
      }catch(error){
        console.error("Error parsing JSON:", error);
      }
    }

  });
  
  connection.addEventListener('close', () => {
    // Notify of disconnection
    console.log(activeConnections.size);

    activeConnections.delete(connection);
    console.log(activeConnections.size);
    console.log("closing...")
    clearInterval(pingInterval)
    broadcastOnlineStatus();
  });
});


function broadcastOnlineStatus() {
  const onlineStatus = [...activeConnections].map((c) => ({
    _id: c._id,
    username: c.username,
  }));
  console.log(" Stat: -----------------------------------")
  console.log(onlineStatus)
  activeConnections.forEach((client) => {
    client.send(JSON.stringify({ online: onlineStatus }));
  });
}

function hashAlphaNumericIds(id1: string, id2: string): string {
  const concatenatedIds = [id1, id2].sort().join('');

  const hash = crypto.createHash('sha256');
  hash.update(concatenatedIds);

  return hash.digest('hex');
}
