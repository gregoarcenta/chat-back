import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface UserMessage {
  clientId?: string;
  username: string;
  message?: string;
  join?: boolean;
  left?: boolean;
}

interface MessagesContextProps {
  privateMessages: UserMessage[];
  setPrivateMessages: Dispatch<SetStateAction<UserMessage[]>>;
  clearPrivateMessages: () => void;
}

const MessagesContext = createContext<MessagesContextProps | null>(null);

export const useMessages = (): MessagesContextProps => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages debe ser usado dentro de MessagesProvider');
  }
  return context;
};

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [privateMessages, setPrivateMessages] = useState<UserMessage[]>([]);
  
  const clearPrivateMessages = () => {
    setPrivateMessages([]);
  };
  
  return (
    <MessagesContext.Provider value={{ privateMessages, setPrivateMessages, clearPrivateMessages }}>
      {children}
    </MessagesContext.Provider>
  );
};