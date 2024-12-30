import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class MessagesService {
  private connectedClients = new Map<string, string>();

  constructor() {}

  // @InjectRepository(User) private readonly userRepository: Repository<User>,

  registerClient(client: Socket, username: string) {
    // const user = await this.userRepository.findOneBy({ id: userId });
    // if (!user) throw new Error('User not found');
    // if (!user.isActive) throw new Error('User not active');

    // this.checkUserConnection(user);
    this.connectedClients.set(client.id, username);
  }

  removeClient(client: Socket) {
    this.connectedClients.delete(client.id);
  }

  getConnectedClients(): string[] {
    return Array.from(this.connectedClients.values());
  }

  getUsername(client: Socket) {
    return this.connectedClients.get(client.id);
  }

  // private checkUserConnection(user: User) {
  //   for (const clientId of Object.keys(this.connectedClients)) {
  //     const connectedClient = this.connectedClients[clientId];
  //
  //     if (connectedClient.user.id === user.id) {
  //       connectedClient.socket.disconnect();
  //       break;
  //     }
  //   }
  // }
}
