import { useContext } from "react";
import Register from "./components/RegisterAndLoginForm";
import { UserContext } from "./components/UserContext";

export default function Routes(){
    const {username, id} = useContext(UserContext);

    if(username){
        return "logged in as" + username
    }
    return(
        <Register/>
    )
}