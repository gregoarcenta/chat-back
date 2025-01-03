'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Login from '@/components/Login';
import Chat from '@/components/Chat';
import RoomList from '@/components/RoomList';
import UserList from '@/components/UserList';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';
import { useMessages } from '@/context/MessagesContext.tsx';

let socket: Socket;

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('global');
  const [users, setUsers] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const { clearPrivateMessages } = useMessages();
  
  useEffect(() => {
    if (username && !socket) {
      socket = io('http://localhost:3000', { extraHeaders: { username } });
      
      socket.on('connect', () => {
        setIsSocketReady(true);
      });
      
      socket.on('user:list', (updatedUsers) => {
        setUsers(updatedUsers);
      });
      
      socket.on('room:users', (updatedRooms) => {
        setUsersInRoom(updatedRooms);
      });
      
      socket.on('exception', (error) => {
        confirmLeaveRoom();
        alert(error.message);
      });
    }
  }, [username, room]);
  
  const handleLogin = (user: string) => {
    setUsername(user);
  };
  
  const handleCreateRoom = (password: string) => {
    clearPrivateMessages();
    setUsersInRoom([]);
    socket.emit('room:leave', { roomId: room });
    const roomId = `private-${Date.now()}`;
    socket.emit('room:create', { roomId, password });
    setRoom(roomId);
  };
  
  const handleJoinRoom = (roomId: string, password: string) => {
    clearPrivateMessages();
    setUsersInRoom([]);
    socket.emit('room:leave', { roomId: room });
    socket.emit('room:join', { roomId, password });
    setRoom(roomId);
  };
  
  const confirmLeaveRoom = () => {
    socket.emit('room:leave', { roomId: room });
    setRoom('global');
    clearPrivateMessages();
    setUsersInRoom([]);
    setShowLeaveConfirmation(false);
  };
  
  const handleLeaveRoom = () => {
    setShowLeaveConfirmation(true);
  };
  
  if (!username) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/4 bg-white p-4 border-b md:border-r md:border-b-0">
        <UserList users={users} usersInRoom={usersInRoom} room={room} />
        <RoomList
          currentRoom={room}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
      <div className="w-full md:w-3/4 flex-grow flex flex-col">
        {isSocketReady && (
          <Chat socket={socket} username={username} room={room} handleLeaveRoom={handleLeaveRoom} />
        )}
      </div>
      <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro que deseas abandonar la sala?</DialogTitle>
            <DialogDescription>
              Esta acción te devolverá al chat global.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowLeaveConfirmation(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmLeaveRoom}>Abandonar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

