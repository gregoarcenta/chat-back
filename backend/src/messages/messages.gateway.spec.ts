import { Test, TestingModule } from '@nestjs/testing';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let service: MessagesService;
  let mockClient: Socket;
  let mockServer: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesGateway, MessagesService],
    }).compile();

    gateway = module.get<MessagesGateway>(MessagesGateway);
    service = module.get<MessagesService>(MessagesService);

    // Mock Socket Client
    mockClient = {
      id: 'mockClientId',
      handshake: { headers: { username: 'testUser' } },
      emit: jest.fn(),
      disconnect: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
    } as unknown as Socket;

    // Mock Socket Server
    mockServer = {
      emit: jest.fn(),
      to: jest.fn().mockReturnValue({ emit: jest.fn() }),
    } as unknown as Server;

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should handle client connection correctly', () => {
    jest.spyOn(service, 'registerClient').mockImplementation(jest.fn());
    gateway.handleConnection(mockClient);

    expect(service.registerClient).toHaveBeenCalledWith(mockClient, 'testUser');
    expect(mockServer.emit).toHaveBeenCalledWith('user:joined', {
      username: 'testUser',
    });
    expect(mockServer.emit).toHaveBeenCalledWith(
      'user:list',
      expect.anything(),
    );
  });

  it('should handle client connection error', () => {
    jest.spyOn(service, 'registerClient').mockImplementation(jest.fn());
    delete mockClient.handshake.headers.username;

    gateway.handleConnection(mockClient);
    expect(service.registerClient).not.toHaveBeenCalled();
    expect(mockClient.emit).toHaveBeenCalledWith('error', {
      message: 'Username is required',
    });
    expect(mockClient.disconnect).toHaveBeenCalled();
  });

  it('should handle client disconnection correctly', () => {
    jest.spyOn(service, 'removeClient').mockImplementation(jest.fn());
    jest.spyOn(service, 'getUsername').mockReturnValue('testUser');

    gateway.handleDisconnect(mockClient);

    expect(service.removeClient).toHaveBeenCalledWith(mockClient);
    expect(mockServer.emit).toHaveBeenCalledWith('user:left', {
      username: 'testUser',
    });
    expect(mockServer.emit).toHaveBeenCalledWith(
      'user:list',
      expect.anything(),
    );
  });

  it('should handle client disconnection error', () => {
    jest.spyOn(service, 'removeClient').mockImplementation(jest.fn());
    jest.spyOn(service, 'getUsername').mockReturnValue(undefined);

    gateway.handleDisconnect(mockClient);

    expect(service.removeClient).toHaveBeenCalledWith(mockClient);
    expect(mockClient.emit).toHaveBeenCalledWith('error', {
      message: 'Username is required',
    });
    expect(mockServer.emit).not.toHaveBeenCalled();
  });

  it('should join to room correctly', () => {
    jest.spyOn(service, 'joinRoom').mockImplementation(jest.fn());
    jest.spyOn(service, 'getUsername').mockReturnValue('testUser');

    const roomId = 'room1';
    const password = '123';
    service.createRoom(roomId, password);
    gateway.onRoomJoin(mockClient, { roomId, password });

    expect(service.joinRoom).toHaveBeenCalledWith(mockClient, roomId, password);
    expect(mockServer.to).toHaveBeenCalledWith(roomId);
    expect(mockServer.to(roomId).emit).toHaveBeenNthCalledWith(
      1,
      'room:joined',
      { username: 'testUser' },
    );
    expect(mockServer.to(roomId).emit).toHaveBeenLastCalledWith(
      'room:users',
      expect.anything(),
    );
  });

  it('should leave to room correctly', () => {
    jest.spyOn(service, 'leaveRoom').mockImplementation(jest.fn());
    jest.spyOn(service, 'getUsername').mockReturnValue('testUser');

    const roomId = 'room1';

    gateway.onRoomLeave(mockClient, { roomId });

    expect(service.leaveRoom).toHaveBeenCalledWith(mockClient, roomId);
    expect(mockServer.to).toHaveBeenCalledWith(roomId);
    expect(mockServer.to(roomId).emit).toHaveBeenNthCalledWith(1, 'room:left', {
      username: 'testUser',
    });
    expect(mockServer.to(roomId).emit).toHaveBeenLastCalledWith(
      'room:users',
      expect.anything(),
    );
  });

  it('should handle sending messages', async () => {
    jest.spyOn(service, 'getUsername').mockReturnValue('testUser');
    const messageData = { message: 'Hello World' };

    gateway.onMessageFromClient(mockClient, messageData);

    // expect(mockServer.to).toHaveBeenCalledWith('room1');
    expect(mockServer.emit).toHaveBeenCalledWith('message:receive', {
      clientId: mockClient.id,
      message: 'Hello World',
      username: 'testUser',
    });
  });

  it('should handle sending messages in room', async () => {
    jest.spyOn(service, 'getUsername').mockReturnValue('testUser');
    const messageData = { message: 'Hello World', roomId: 'room1' };

    gateway.onMessageFromClient(mockClient, messageData);

    expect(mockServer.to).toHaveBeenCalledWith('room1');
    expect(mockServer.to('room1').emit).toHaveBeenCalledWith(
      'message:receive:private',
      {
        clientId: mockClient.id,
        message: 'Hello World',
        username: 'testUser',
      },
    );
  });
});
