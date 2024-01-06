import { useContext } from "react";
import Register from "./components/RegisterAndLoginForm";
import { UserContext } from "./components/UserContext";
import Chat from "./components/Chat";

export default function Routes(){
    const {username, id} = useContext(UserContext);

    if(username){
        return <Chat/>
    }
    return(
        <Register/>
    )
}