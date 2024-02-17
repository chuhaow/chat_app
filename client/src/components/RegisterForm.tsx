import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';

interface RegisterFormProps {
  setRegisterUsername: (username: string) => void;
  setId: (id: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({setRegisterUsername, setId}) =>{
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>): Promise<void> =>{
        ev.preventDefault();
        try{
            const {data} = await axios.post('auth/register', {username,password});
            setRegisterUsername(username)
            setId(data.id);
        }catch (error){
            if(axios.isAxiosError(error)){
                const axiosError = error as AxiosError;
            
                if(axiosError.response?.status === 400){
                    setError("Username already exists");
                }else{
                    setError('An error has occurred. Please try again later.');
                    console.log(axiosError.response)
                }
            }else{
                setError("An unexpected error occurred")
            }

        }

    };
            return (
            <form className="w-64 mx-auto mb-4" onSubmit={handleSubmit}>
              <input
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                type="text"
                placeholder="username"
                className="block w-full rounded-md p-2 mb-2 border"
              />
              <input
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                type="password"
                placeholder="password"
                className="block w-full rounded-md p-2 mb-2 border"
              />
              <button className="bg-blue-500 text-white block w-full rounded-md">Register</button>
              
              {error && <div className="text-red-400 text-center">{error}</div>}
            </form>
        );
}
export default RegisterForm
