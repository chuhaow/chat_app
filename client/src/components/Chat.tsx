import { useEffect, useState } from "react";
import Avatar from "./Avatar";

export default function Chat(){
    const [ws, setWs] = useState<WebSocket | null>(null)
    const [onlinePeople, setOnlinePeople] = useState<{[userId: string]: string}>({});

    useEffect(() =>{
        const websocket: WebSocket = new WebSocket('ws://localhost:4000')
        setWs(websocket);
        ws?.addEventListener('message', handleMessage)
    }, [])

    function handleMessage(e: MessageEvent){
        const messageData = JSON.parse(e.data);
        console.log(messageData)
        if('online' in messageData){
            showOnline(messageData.online)
        }
    }

    function showOnline(people: []){
        const peopleSet: {[userId: string]: string} = {};
        people.forEach(({userId,username}) =>{
            peopleSet[userId] = username
        })
        setOnlinePeople(peopleSet);
        console.log(peopleSet);
    }

    return(
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/3 pl-4 pt-4">
                <div className="text-blue-500 font-bold">Chat App</div>
                {Object.keys(onlinePeople).map(userId =>(
                    <div className="border-b border-gray-100 py-2 flex items-center gap-2">
                        <Avatar userId={userId} username={onlinePeople[userId]}/>
                        {onlinePeople[userId]}
                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-100 w-2/3 p-2">
                <div className="flex-grow"> 
                Message History
                </div>

                <div className="flex gap-2">
                    <input type="text" placeholder="Message here"className="bg-white border p-2 text-white flex-grow rounded-sm"></input>
                    <button className="bg-blue-500 p-2 text-white rounded-sm">Send</button>
                </div>
            </div>
        </div>
    );
}