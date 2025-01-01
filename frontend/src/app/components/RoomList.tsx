import { useState } from 'react';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/ui/dialog';

interface RoomListProps {
  currentRoom: string;
  onCreateRoom: (password: string) => void;
  onJoinRoom: (roomId: string, password: string) => void;
}

export default function RoomList({ currentRoom, onCreateRoom, onJoinRoom }: RoomListProps) {
  const [createPassword, setCreatePassword] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  const handleCreateRoom = () => {
    if (createPassword) {
      onCreateRoom(createPassword);
      setCreatePassword('');
      setShowCreateDialog(false);
    }
  };
  
  const handleJoinRoom = () => {
    if (joinRoomId && joinPassword) {
      onJoinRoom(joinRoomId, joinPassword);
      setJoinRoomId('');
      setJoinPassword('');
      setShowJoinDialog(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Salas</h2>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          disabled={currentRoom === 'global'}
        >
          Chat Global
        </Button>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">Crear Sala Privada</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Sala Privada</DialogTitle>
              <DialogDescription>
                Ingresa una contraseña para tu sala privada.
              </DialogDescription>
            </DialogHeader>
            <Input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Contraseña de la sala"
            />
            <Button onClick={handleCreateRoom}>Crear Sala</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Unirse a Sala Privada</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unirse a Sala Privada</DialogTitle>
              <DialogDescription>
                Ingresa el ID y la contraseña de la sala privada.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(e.target.value)}
              placeholder="ID de la sala"
              className="mb-2"
            />
            <Input
              type="password"
              value={joinPassword}
              onChange={(e) => setJoinPassword(e.target.value)}
              placeholder="Contraseña de la sala"
              className="mb-2"
            />
            <Button onClick={handleJoinRoom}>Unirse a Sala</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

