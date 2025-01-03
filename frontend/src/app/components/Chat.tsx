import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { useMessages, UserMessage } from '@/context/MessagesContext.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover.tsx';

interface ChatProps {
  socket: Socket;
  username: string;
  room: string;
  password?: string;
  handleLeaveRoom: () => void;
}

export default function Chat({ socket, username, room, password, handleLeaveRoom }: ChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<UserMessage[]>([]);
  const { privateMessages, setPrivateMessages } = useMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    socket.on('message:receive', (message: UserMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on('message:receive:private', (message: UserMessage) => {
      setPrivateMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socket.on('user:joined', ({ username }: { username: string }) => {
      const joinUser: UserMessage = {
        join: true,
        username,
      };
      setMessages((prevMessages) => [...prevMessages, joinUser]);
    });
    
    socket.on('room:joined', ({ username }: { username: string }) => {
      const joinUser: UserMessage = {
        join: true,
        username,
      };
      setPrivateMessages((prevMessages) => [...prevMessages, joinUser]);
    });
    
    socket.on('user:left', ({ username }: { username: string }) => {
      const leftUser: UserMessage = {
        left: true,
        username,
      };
      setMessages((prevMessages) => [...prevMessages, leftUser]);
    });
    
    socket.on('room:left', ({ username }: { username: string }) => {
      const leftUser: UserMessage = {
        left: true,
        username,
      };
      setPrivateMessages((prevMessages) => [...prevMessages, leftUser]);
    });
    
    return () => {
      socket.off('message:receive:private');
      socket.off('message:receive');
      socket.off('user:joined');
      socket.off('user:left');
      socket.off('room:joined');
      socket.off('room:left');
    };
  }, []);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, privateMessages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message) {
      socket.emit('message:send', { message, roomId: room === 'global' ? null : room });
      setMessage('');
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('¡Contraseña copiada al portapapeles!');
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white p-4 border-b flex justify-between">
        <h2 className="text-xl font-bold">
          {room === 'global' ? 'Chat Global' : `Sala Privada: ${room}`}
        </h2>
        {room !== 'global' && password && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Más</Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="p-4 space-y-2">
                <div>
                  <strong>ID de sala:</strong> {room}
                </div>
                <div>
                  <strong>Contraseña:</strong>
                  <span
                    className="ml-2 cursor-pointer text-blue-500"
                    onClick={() => handleCopy(password!)}
                  >
                  {password} (Copia)
              </span>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {room === 'global' ? messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.username === username ? 'text-right' : 'text-left'}`}>
            {msg.join && (
              <>
                <span className="font-bold text-sm text-green-500">{msg.username} </span>
                <span>se ha unido al chat</span>
              </>
            )}
            {msg.left && (
              <>
                <span className="font-bold text-sm text-red-500">{msg.username} </span>
                <span>ha salido del chat</span>
              </>
            )}
            {msg.message && (
              <>
                <span className="font-bold text-sm">{msg.username}: </span>
                <span className="inline-block bg-gray-200 rounded-lg py-2 px-3 max-w-[80%] break-words">
            {msg.message}
          </span>
              </>
            )}
          </div>
        )) : privateMessages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.username === username ? 'text-right' : 'text-left'}`}>
            {msg.join && (
              <>
                <span className="font-bold text-sm text-green-500">{msg.username} </span>
                <span>se ha unido a la sala</span>
              </>
            )}
            {msg.left && (
              <>
                <span className="font-bold text-sm text-red-500">{msg.username} </span>
                <span>ha salido de la sala</span>
              </>
            )}
            {msg.message && (
              <>
                <span className="font-bold text-sm">{msg.username}: </span>
                <span className="inline-block bg-gray-200 rounded-lg py-2 px-3 max-w-[80%] break-words">
            {msg.message}
          </span>
              </>
            )}
          </div>
        ))
        }
        
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex flex-col sm:flex-row">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 mb-2 sm:mb-0 sm:mr-2"
          />
          <Button type="submit" className="w-full sm:w-auto">Enviar</Button>
        </div>
      </form>
      {room !== 'global' && (
        <div className="p-4 bg-white border-t">
          <Button onClick={handleLeaveRoom} variant="destructive">
            Abandonar Sala
          </Button>
        </div>
      )}
    </div>
  );
}

