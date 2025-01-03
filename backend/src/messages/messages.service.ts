import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MessagesService {
  private connectedClients = new Map<string, string>();
  private rooms = new Map<string, { password: string; clients: Set<string> }>();

  registerClient(client: Socket, username: string) {
    this.connectedClients.set(client.id, username);
  }

  removeClient(client: Socket) {
    this.connectedClients.delete(client.id);

    for (const [roomId, room] of this.rooms.entries()) {
      if (room.clients.delete(client.id) && room.clients.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.values());
  }

  getUsername(client: Socket) {
    return this.connectedClients.get(client.id);
  }

  hasRoom(roomId: string) {
    return this.rooms.has(roomId);
  }

  createRoom(roomId: string, password: string) {
    if (!this.hasRoom(roomId)) {
      this.rooms.set(roomId, { password, clients: new Set<string>() });
    }
  }

  joinRoom(client: Socket, roomId: string, password: string) {
    const room = this.rooms.get(roomId);

    if (this.validateRoomPassword(roomId, password)) {
      room.clients.add(client.id);
    } else {
      throw new Error(`La contraseña para la sala: ${roomId} no es valida`);
    }
  }

  leaveRoom(client: Socket, roomId: string) {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId);
      room.clients.delete(client.id);

      if (room.clients.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  getClientsInRoom(roomId: string): string[] {
    if (this.hasRoom(roomId)) {
      const room = this.rooms.get(roomId);
      const clientIds = Array.from(room.clients);
      return clientIds.map((clientId) => this.connectedClients.get(clientId));
    }
    return [];
  }

  validateRoomPassword(roomId: string, password: string): boolean {
    const room = this.rooms.get(roomId);
    return room ? room.password === password : false;
  }
}
