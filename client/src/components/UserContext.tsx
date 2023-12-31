import React, { createContext, useState, ReactNode } from 'react';

interface UserContextProps {
  username: string | null;
  setLoggedInUsername: React.Dispatch<React.SetStateAction<string | null>>;
  id: string | null;
  setId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextProps>({ username: null, setLoggedInUsername: () => {}, id: null, setId: () => {} });

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps): JSX.Element {
  const [username, setLoggedInUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);

  const contextValue: UserContextProps = { username, setLoggedInUsername, id, setId };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}