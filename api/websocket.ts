import ws from 'ws';
import { Request } from 'express';
import { IUserdata } from './interfaces/IUserdata';
import { IMessageData as IMessagePackage } from './interfaces/IMessageData';
import jwt from 'jsonwebtoken'
import { IConnectionData, generateConnectionId } from './interfaces/IConnectionData';
import UniqueConnectionSet from './helpers/UniqueConnectionSet';
import MessageModel from './models/Message';
import fs from 'fs'

const jwtSecret = process.env.JWT_SECRET || '';
const activeConnections = new UniqueConnectionSet();
export default function WebSocketServerSetUp(server: any){
    const wss = new ws.WebSocketServer({ server });
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
                connection.connectionId = generateConnectionId(userId, token)
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
    
              const senderAndReceiverId = messageData.sender + messageData.recipient
              filename = senderAndReceiverId + '_'+ messageData.file.info
              const path: string = __dirname + '/Uploads/' + filename
              const fileData: string[] = (messageData.file.data as string).split(',')
    
              const bufferData = Buffer.from(fileData[fileData.length-1],'base64');
              fs.promises.writeFile(path,bufferData)
              .then( () => {
                console.log('file saved: ' + path)
              })
              .catch( (error) =>{
                console.error('Error saving file:', error)
              })
              
            }
    
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
}

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
  