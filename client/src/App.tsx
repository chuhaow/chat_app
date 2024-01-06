import axios from "axios"
import { UserContextProvider } from "./components/UserContext";
import Routes from "./Routes";
import Chat from "./components/Chat";


function App() {
  axios.defaults.baseURL='http://localhost:4000'
  axios.defaults.withCredentials=true;

  return (
    //<Chat/>
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  )
}

export default App
