import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/message.dto';

interface SendMessage {
  clientId: string;
  username: string;
  message: string;
}

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket): any {
    try {
      const username: string = client.handshake.headers.username as string;

      if (!username) {
        client.emit('error', { message: 'Username is required' });
        client.disconnect();
        return;
      }

      this.messagesService.registerClient(client, username);

      this.server.emit('user:joined', { username });
      this.server.emit('user:list', this.messagesService.getConnectedClients());
    } catch (error) {
      console.error('Error in handleConnection:', error.message);
      client.emit('error', { message: 'Connection failed: ' + error.message });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): any {
    try {
      const username = this.messagesService.getUsername(client);

      if (!username) {
        this.messagesService.removeClient(client);
        client.emit('error', { message: 'Username is required' });
        return;
      }

      this.messagesService.removeClient(client);

      this.server.emit('user:left', { username });
      this.server.emit('user:list', this.messagesService.getConnectedClients());
    } catch (error) {
      console.error('Error in handleDisconnect:', error.message);
      client.emit('error', {
        message: 'Disconnection failed: ' + error.message,
      });
    }
  }

  @SubscribeMessage('room:create')
  onRoomCreate(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId, password }: { roomId: string; password: string },
  ) {
    if (!this.messagesService.hasRoom(roomId)) {
      this.messagesService.createRoom(roomId, password);
    }
    this.onRoomJoin(client, { roomId, password });
  }

  @SubscribeMessage('room:join')
  onRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId, password }: { roomId: string; password: string },
  ) {
    const username = this.messagesService.getUsername(client);

    if (!this.messagesService.hasRoom(roomId)) {
      throw new WsException(`La sala ${roomId} no fue encontrada`);
    }

    try {
      this.messagesService.joinRoom(client, roomId, password);
    } catch (error) {
      throw new WsException(error.message);
    }

    client.join(roomId);

    this.server.to(roomId).emit('room:joined', { username });
    this.server
      .to(roomId)
      .emit('room:users', this.messagesService.getClientsInRoom(roomId));
  }

  @SubscribeMessage('room:leave')
  onRoomLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: { roomId: string },
  ) {
    const username = this.messagesService.getUsername(client);

    this.messagesService.leaveRoom(client, roomId);

    client.leave(roomId);

    this.server.to(roomId).emit('room:left', { username });
    this.server
      .to(roomId)
      .emit('room:users', this.messagesService.getClientsInRoom(roomId));
  }

  @SubscribeMessage('message:send')
  onMessageFromClient(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto & { roomId?: string },
  ) {
    try {
      const messageToSend: SendMessage = {
        clientId: client.id,
        message: data.message,
        username: this.messagesService.getUsername(client),
      };

      if (data.roomId) {
        this.server
          .to(data.roomId)
          .emit('message:receive:private', messageToSend);
      } else {
        this.server.emit('message:receive', messageToSend);
      }
    } catch (error) {
      console.error('Error in message:send:', error.message);
      client.emit('error', {
        message: 'Message sending failed: ' + error.message,
      });
    }
  }
}
