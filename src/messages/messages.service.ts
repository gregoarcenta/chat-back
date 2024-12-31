import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MessagesService {
  private connectedClients = new Map<string, string>();
  private rooms = new Map<string, Set<string>>();

  registerClient(client: Socket, username: string) {
    this.connectedClients.set(client.id, username);
  }

  removeClient(client: Socket) {
    this.connectedClients.delete(client.id);

    for (const [roomId, members] of this.rooms.entries()) {
      console.log({ members });
      if (members.delete(client.id) && members.size === 0) {
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

  joinRoom(client: Socket, roomId: string) {
    try {
      if (!this.rooms.has(roomId)) this.rooms.set(roomId, new Set());
      this.rooms.get(roomId).add(client.id);
    } catch (error) {
      console.error('Error joining room:', error.message);
      client.emit('error', {
        message: 'Failed to join room: ' + error.message,
      });
    }
  }

  leaveRoom(client: Socket, roomId: string) {
    try {
      if (this.rooms.has(roomId)) {
        const members = this.rooms.get(roomId);
        members.delete(client.id);

        if (members.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    } catch (error) {
      console.error('Error leaving room:', error.message);
      client.emit('error', {
        message: 'Failed to leave room: ' + error.message,
      });
    }
  }

  getClientsInRoom(roomId: string): string[] {
    if (this.rooms.has(roomId)) {
      const clientIds = Array.from(this.rooms.get(roomId));
      return clientIds.map((clientId) => this.connectedClients.get(clientId));
    }
    return [];
  }
}
