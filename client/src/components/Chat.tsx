import { FormEvent, useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from "lodash";

import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import IMessage from "../Interfaces/IMessage"
import IOnlineMessage from "../Interfaces/IOnlineMessage"
import IUserData from "../Interfaces/IUserData";
import axios from "axios";


export default function Chat(){
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [onlinePeople, setOnlinePeople] = useState<{[userId: string]: string}>({});
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
    const [newTextMessage, setTextMessage] = useState<string>("");
    const [messages, setMessages] = useState<IMessage[]>([])
    const {id} = useContext(UserContext)
    const messageBoxRef = useRef<HTMLDivElement>(null)

    type WebSocketMessage = IMessage | IOnlineMessage;

    useEffect(() =>{
        connectToWs()
    }, [])

    function connectToWs(){
        const websocket: WebSocket = new WebSocket('ws://localhost:4000')
        websocket.addEventListener('open', () =>{
            console.log("WebSocket connection opened");
            setWs(websocket);
        })
        websocket.addEventListener('close',() =>{
            setTimeout(() =>{
                console.log("Disconnected trying to reconnect...")
                connectToWs(); 
            }, 1000)
           
        } )
    }
    
    ws?.addEventListener('message', handleMessage)
    function handleMessage(e: MessageEvent){
        try{
            const messageData: WebSocketMessage = JSON.parse(e.data);

            if('online' in messageData){
                handleOnlineMessage(messageData as IOnlineMessage);
            }else{
                handleTextMessage(messageData as IMessage);
            }
        }catch(error){
            console.error("Error parsing message: ", error);
        }
    }

    function handleOnlineMessage(onlineMessage: IOnlineMessage) {
        showOnline(onlineMessage.online);
    }
      
    function handleTextMessage(textMessage: IMessage) {
        console.log(textMessage);
        setMessages((prev) => ([...prev, {
            id: textMessage.id, 
            sender: textMessage.sender, 
            text:textMessage.text, 
            isOwner: false }]));
    }

    function showOnline(people: IUserData[]){
        const peopleSet: {[userId: string]: string} = {};
        people.forEach(({userId,username}) =>{
            if(userId !== id){
                peopleSet[userId] = username
            }
        })
        console.log(peopleSet)
        setOnlinePeople(peopleSet);
        console.log(peopleSet);
    }

    function sendMessage(e: FormEvent){
        e.preventDefault();
        console.log("sending")
        ws?.send(JSON.stringify({
            message: {
                recipient: selectedChat,
                text: newTextMessage
            }
        }))
        setTextMessage("");
        // Temp: Message sent won't have ids
        // Set Messages should rely on server to get messages
        setMessages(prev => ([...prev,{
            id: Date.now().toString(), 
            sender: "", 
            text: newTextMessage, 
            isOwner: true} ]));
        

        
    }

    useEffect(() =>{
        const div = messageBoxRef.current;
        if(div){
            div.scrollTop = div.scrollHeight;
        }else{
            console.log("Unable to get reference to message box")
        }
    }, [messages])

    useEffect( () =>{
        if(selectedChat){
            axios.get(`/messageHistory/${selectedChat}`)
        }

    }, [selectedChat])

    const messagesWithoutDups: IMessage[] = uniqBy(messages, 'id')
    return(
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/3">
                <div className="text-blue-500 font-bold p-4">Chat App</div>
                {Object.keys(onlinePeople).map(userId =>(
                    <div key={userId} onClick={() => setSelectedChat(userId)}className={`border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer ${userId === selectedChat ? 'bg-blue-100' : ''}`} >
                        <Avatar userId={userId} username={onlinePeople[userId]}/>
                        {onlinePeople[userId]}
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-100 w-2/3 p-2">
                <div className="flex-grow"> 
                    {!selectedChat &&(
                        <div className="flex h-full flex-grow items-center justify-center"> 
                            <div className="text-gray-400"> no selected chat </div>
                        </div>
                    )} 
                    {!!selectedChat &&(
                        <div className="relative h-full">    
                            <div ref={messageBoxRef} className="overflow-y-scroll absolute inset-0">
                                {messagesWithoutDups.map(message =>(
                                    <div className={` ${message.isOwner ? 'text-right' : 'text-left'}`}>
                                        <div className={`inline-block p-2 m-2 rounded-md text-sm ${message.isOwner === true ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                            {message.text}
                                        </div>
                                    </div>
                                    
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {!!selectedChat && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text" 
                            value={newTextMessage} 
                            onChange={ev => setTextMessage(ev.target.value)}
                            placeholder="Message here"
                            className="bg-white border p-2 flex-grow rounded-sm text-black"></input>
                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">Send</button>
                    </form>
                )}

            </div>
        </div>
    );
}