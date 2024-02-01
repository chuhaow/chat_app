import { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from "lodash";

import Avatar from "./Avatar";
import { UserContext } from "./UserContext";
import IMessage from "../Interfaces/IMessage"
import IOnlineMessage from "../Interfaces/IOnlineMessage"
import IUserData from "../Interfaces/IUserData";
import axios from "axios";
import WebSocketManager from "./WebSocketManager";
import Contact from "./Contact";
import IFile from "../Interfaces/IFile";
import * as crypto from 'crypto';
import DummyValue from "../Interfaces/IDummyValue";

export default function Chat(){
    const [onlinePeople, setOnlinePeople] = useState<{[userId: string]: IUserData}>({});
    const [selectedChat, setSelectedChat] = useState<string | null>(null)
    const [newTextMessage, setTextMessage] = useState<string>("");
    const [messages, setMessages] = useState<IMessage[]>([])
    const [offlinePeople, setOfflinePeople] = useState<{[userId: string]: IUserData}>({});
    const {username,id, setId, setLoggedInUsername} = useContext(UserContext)
    const messageBoxRef = useRef<HTMLDivElement>(null)
    const webSocketManagerRef = useRef<WebSocketManager | null>(null);
    const fileInputRef = useRef<HTMLInputElement | DummyValue>({ value: '' });

    useEffect(() =>{
        //connectToWs()
        const manager = new WebSocketManager({onMessageReceived: handleMessage});
        webSocketManagerRef.current = manager;

    }, [])


    //ws?.addEventListener('message', handleMessage)
    function handleMessage(messageData: IMessage | IOnlineMessage){
        try{
            //const messageData: WebSocketMessage = JSON.parse(e.data);

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
        showOnline(onlineMessage.online.filter(value => Object.keys(value).length !== 0));
        console.log(onlineMessage.online.filter(value => Object.keys(value).length !== 0))
    }
      
    function handleTextMessage(textMessage: IMessage) {
        console.log(textMessage);
        setMessages((prev) => ([...prev, {
            _id: textMessage._id, 
            sender: textMessage.sender, 
            text:textMessage.text, 
            recipient: textMessage.recipient,
            file: textMessage.file }]));
    }

    function showOnline(people: IUserData[]){
        const peopleSet: {[_id: string]: IUserData} = {};
        people.forEach((p: IUserData)  =>{

            if(p._id !== id){
                console.log(p);
                console.log(id)
                peopleSet[p._id] = p
            }
        })
        
        setOnlinePeople(peopleSet);
        console.log(peopleSet)
    }

    function sendMessage(e: FormEvent | null, file: IFile | null = null ){
        if(e) e.preventDefault();
        console.log("sending")
        webSocketManagerRef.current?.sendMessage(
            {
                _id: Date.now().toString(),
                text: newTextMessage,
                sender: id as string,
                recipient: selectedChat as string,
                file: file
            }
        )
        setTextMessage("");

        if(file){
            setTimeout(() =>{
                axios.get(`/messageHistory/${selectedChat}`).then( res =>{
                    //Todo: Update to get target api for just latest message
                    const {data} = res;
                    console.log(data)
                    console.log(Date.now());
                    setMessages(data)
                })
            }, 100)
            
        }else{
            // Temp: Message sent won't have ids
            // Set Messages should rely on server to get messages
            setMessages(prev => ([...prev,{
            _id: Date.now().toString(), 
            sender: id as string, 
            text: newTextMessage, 
            recipient: selectedChat as string,
            file: file} ]));
        }
        
    }
    function logout(){
        axios.post('/logout').then( () =>{
            setId(null);
            setLoggedInUsername(null);
            webSocketManagerRef.current?.cleanup();
        })
    }
    function sendFile(ev: ChangeEvent<HTMLInputElement>){
        console.log(ev.target.files)
        const file = ev.target?.files?.[0]
        if(file){
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () =>{
                sendMessage(null,{
                    info: file.name,
                    data: reader.result
                })
            }
            console.log(fileInputRef.current)
            if (fileInputRef.current) {
                console.log("Resetting file")
                fileInputRef.current.value = '';
            }
        }
        

    }
    //Move this to a util class


    useEffect(() =>{
        const div = messageBoxRef.current;
        if(div){
            div.scrollTop = div.scrollHeight;
        }else{
            console.log("Unable to get reference to message box")
        }
    }, [messages])

    useEffect( () =>{
        console.log(selectedChat)
        if(selectedChat){
            axios.get(`/messageHistory/${selectedChat}`).then( res =>{
                const {data} = res;
                console.log(res)
                setMessages(data)
            })
        }

    }, [selectedChat])

    useEffect( () =>{
        axios.get('/people').then(res =>{
            const offlinePeople = res.data.
            filter( (p: { _id: string | null; }) => p._id !== id)
            .filter( (p: { _id: string; }) => !Object.keys( onlinePeople).includes(p._id));

            const offlinePeopleSet: {[_id: string]: IUserData} = {};
            offlinePeople.forEach((p: IUserData) =>{
                offlinePeopleSet[p._id] = p;
            })
            console.log(offlinePeopleSet)
            setOfflinePeople(offlinePeopleSet)
        })
        
    }, [onlinePeople])

    const messagesWithoutDups: IMessage[] = uniqBy(messages, '_id')
    console.log(messagesWithoutDups)
    return(
        
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/3 flex flex-col">
                <div className="flex-grow">
                    <div className="text-blue-500 font-bold p-4">Chat App</div>
                    {Object.keys(onlinePeople).map(userId =>(
                        <Contact 
                        username={onlinePeople[userId].username} 
                        id={userId}
                        onClick={ () => setSelectedChat(userId)}
                        selectedUserId={selectedChat}
                        online={true}/>
                    ))}
                    {Object.keys(offlinePeople).map(userId =>(
                        <Contact 
                        username={offlinePeople[userId].username} 
                        id={userId}
                        onClick={ () => setSelectedChat(userId)}
                        selectedUserId={selectedChat}
                        online={false}/>
                    ))}
                </div>
                <div className="p-2 text-center">
                    <span className="mr-2 text-sm text-gray-600">Welcome {username}</span>
                    <button 
                    onClick={logout}
                    className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">Logout</button>
                    </div>

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
                                    <div className={` ${message.sender === id ? 'text-right' : 'text-left'}`}>
                                        <div className={`text-left inline-block p-2 m-2 rounded-md text-sm ${message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500'}`}>
                                            {message.text}
                                            {message.file &&(
                                                <div >
                                                    <a target="_blank" className="underline flex items-center gap-1" href={axios.defaults.baseURL + '/uploads/' + message.file as string }>
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                                                        </svg>
                                                        {(message.file as string).replace(message.sender + message.recipient + '_', '')}
                                                    </a>
                                                </div>
                                            )}
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

                        <label className="bg-gray-200 p-2 rounded-sm border border-gray-200 cursor-pointer">
                            <input type="file" className="hidden"  ref ={fileInputRef as React.RefObject<HTMLInputElement>} onChange={sendFile}></input>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
                            </svg>
                        </label>
                    </form>
                )}

            </div>
        </div>
    );
}