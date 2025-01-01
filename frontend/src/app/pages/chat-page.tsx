'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Login from '@/components/Login';
import Chat from '@/components/Chat';
import RoomList from '@/components/RoomList';
import UserList from '@/components/UserList';
import { Button } from '@/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog';

let socket: Socket;

export default function ChatPage() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('global');
  const [users, setUsers] = useState([]);
  const [, setRooms] = useState(['global']);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  
  useEffect(() => {
    if (username && !socket) {
      socket = io('http://localhost:3000', { extraHeaders: { username } });
      // socket.emit('join', { username, room });
      
      socket.on('connect', () => {
        setIsSocketReady(true);
      });
      
      socket.on('user:list', (updatedUsers) => {
        // console.log(updatedUsers);
        setUsers(updatedUsers);
      });
      
      socket.on('room:list', (updatedRooms) => {
        setRooms(updatedRooms);
      });
      
      return () => {
        socket.off('connect');
        socket.off('user:list');
        socket.off('room:list');
      };
    }
  }, [username, room]);
  
  const handleLogin = (user: string) => {
    setUsername(user);
  };
  
  const handleCreateRoom = (password: string) => {
    const newRoom = `private-${Date.now()}`;
    socket!.emit('createRoom', { username, newRoom, password });
    setRoom(newRoom);
  };
  
  const handleJoinRoom = (roomId: string, password: string) => {
    socket.emit('room:join', { roomId, password });
    setRoom(roomId);
  };
  
  const handleLeaveRoom = () => {
    setShowLeaveConfirmation(true);
  };
  
  const confirmLeaveRoom = () => {
    socket!.emit('room:leave', { username, room });
    setRoom('global');
    setShowLeaveConfirmation(false);
  };
  
  if (!username) {
    return <Login onLogin={handleLogin} />;
  }
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      <div className="w-full md:w-1/4 bg-white p-4 border-b md:border-r md:border-b-0">
        <UserList users={users} />
        <RoomList
          currentRoom={room}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
      <div className="w-full md:w-3/4 flex-grow flex flex-col">
        {isSocketReady && (
          <Chat socket={socket} username={username} room={room} />
        )}
        {room !== 'global' && (
          <div className="p-4 bg-white border-t">
            <Button onClick={handleLeaveRoom} variant="destructive">
              Abandonar Sala
            </Button>
          </div>
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

