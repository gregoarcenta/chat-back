import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { MessageDto } from './dto/create-message.dto';

interface SendMessage {
  clientId: string;
  username: string;
  message: string;
  to?: string;
}

@WebSocketGateway({ cors: true })
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  handleConnection(client: Socket): any {
    const username: string = client.handshake.headers.username as string;
    this.messagesService.registerClient(client, username);
    this.server.emit('user:joined', { username });
    this.server.emit('user:list', this.messagesService.getConnectedClients());
    console.log(`User '${username}' connected (ID: '${client.id}')`);
  }

  handleDisconnect(client: Socket): any {
    const username = this.messagesService.getUsername(client);
    this.messagesService.removeClient(client);
    this.server.emit('user:left', { username });
    this.server.emit('user:list', this.messagesService.getConnectedClients());
    console.log(`User '${username}' disconnected (ID: '${client.id}')`);
  }

  @SubscribeMessage('message:send')
  onMessageFromClient(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageDto,
  ) {
    const username = this.messagesService.getUsername(client);
    const messageToSend: SendMessage = {
      clientId: client.id,
      message: data.message,
      username,
    };
    this.server.emit('message:receive', messageToSend);
    console.log(
      `User '${username}' (ID: '${client.id}') sent "${data.message}"`,
    );
  }

  @SubscribeMessage('room:join')
  onRoomJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() { roomId }: { roomId: string },
  ) {
    console.log(`Client with id: '${client.id}' joined room '${roomId}'`);
    client.join(roomId);
  }

  // @SubscribeMessage('message:private')
  // onPrivateMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() { to, message }: { to: string; message: string },
  // ) {
  //   console.log(`Private message from ${client.id} to ${to}: "${message}"`);
  //   this.server
  //     .to(to)
  //     .emit('message:private:receive', { from: client.id, message });

  // }
}
