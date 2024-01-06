export default function Chat(){
    return(
        <div className="flex h-screen">
            <div className="bg-blue-50 w-1/3">
                Contacts
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