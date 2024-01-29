import {useContext, useState} from "react"
import axios, { AxiosError } from 'axios'
import { UserContext } from "./UserContext";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";
export default function RegisterAndLoginForm(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const {setLoggedInUsername, setId} = useContext(UserContext);
    const [IsLoginOrRegister, setIsLoginOrRegister] = useState('register')
    const [error, setError] = useState<string | null>(null);
    async function handleSubmit(ev: React.FormEvent<HTMLFormElement>){
        const endpoint = IsLoginOrRegister === 'register' ? '/register': '/login';
        ev.preventDefault();
        try{
            const {data} = await axios.post(endpoint, {username,password})
            setLoggedInUsername(username);
            setId(data.id);
        }catch(error){
            if(axios.isAxiosError(error)){
                const axiosError = error as AxiosError;

                if(axiosError.response?.status === 400){
                    setError('Username already exists');
                }else if(axiosError.response?.status === 401){
                    setError(axiosError.response?.statusText)
                }
                else{
                    setError("An error has occurred. Please try again later.")
                }
            }else{
                setError("An unexpected error occurred");
            }
        }

    }

    return(
        <div className="bg-blue-50 h-screen flex flex-col items-center justify-center">
    
            {IsLoginOrRegister === 'register' ? (
                <RegisterForm setRegisterUsername={setLoggedInUsername} setId={setId} />
            ): (
                <LoginForm setLoggedInUsername={setLoggedInUsername} setId={setId}/>
            )}
            <div className="text-center">
                    {IsLoginOrRegister === 'register' && (
                        <div>
                            Already a member?  
                            <button onClick={() => setIsLoginOrRegister('login')}>
                                Login Here
                            </button>
                        </div>
                    )}
                    
                    {IsLoginOrRegister === 'login' && (
                        <div>
                            Don't have an account?  
                            <button onClick={() => setIsLoginOrRegister('register')}>
                                Register Here
                            </button>
                        </div>
                    )}
                </div>

        </div>
    )
}