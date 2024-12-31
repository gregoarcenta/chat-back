import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { Socket } from 'socket.io';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MessagesService],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should add a client to connectedClients', () => {
    const mockClient = { id: '123' } as Socket;

    service.registerClient(mockClient, 'testUser');

    const connectedClients = service.getConnectedClients();
    expect(connectedClients).toContain('testUser');
  });

  it('should remove a client from connectedClients', () => {
    const mockClient = { id: '123' } as Socket;

    service.registerClient(mockClient, 'testUser');
    service.removeClient(mockClient);

    const connectedClients = service.getConnectedClients();
    expect(connectedClients).not.toContain('testUser');
  });

  it('should remove a client from rooms and delete the room if empty', () => {
    const mockClient = { id: '123' } as Socket;

    service.registerClient(mockClient, 'testUser');
    service.joinRoom(mockClient, 'room1');

    service.removeClient(mockClient);

    const clientsInRoom = service.getClientsInRoom('room1');
    expect(clientsInRoom).toHaveLength(0);
  });

  it('should add a client to a room', () => {
    const mockClient = { id: '123' } as Socket;
    service.registerClient(mockClient, 'testUser');
    service.joinRoom(mockClient, 'room1');

    const clientsInRoom = service.getClientsInRoom('room1');
    expect(clientsInRoom).toContain('testUser');
  });

  it('should not throw an error if the room already exists', () => {
    const mockClient = { id: '123' } as Socket;
    service.registerClient(mockClient, 'testUser');
    service.joinRoom(mockClient, 'room1');

    expect(() => service.joinRoom(mockClient, 'room1')).not.toThrow();
  });

  it('should remove a client from a room', () => {
    const mockClient = { id: '123' } as Socket;
    service.registerClient(mockClient, 'testUser');
    service.joinRoom(mockClient, 'room1');
    service.leaveRoom(mockClient, 'room1');

    const clientsInRoom = service.getClientsInRoom('room1');
    expect(clientsInRoom).not.toContain('testUser');
  });

  it('should delete the room if it becomes empty', () => {
    const mockClient = { id: '123' } as Socket;
    service.registerClient(mockClient, 'testUser');
    service.joinRoom(mockClient, 'room1');
    service.leaveRoom(mockClient, 'room1');

    expect(service.getClientsInRoom('room1')).toHaveLength(0);
  });

  it('should return a list of connected clients', () => {
    const mockClient1 = { id: '123' } as Socket;
    const mockClient2 = { id: '456' } as Socket;

    service.registerClient(mockClient1, 'user1');
    service.registerClient(mockClient2, 'user2');

    const connectedClients = service.getConnectedClients();
    expect(connectedClients).toEqual(['user1', 'user2']);
  });

  it('should return a list of clients in a room', () => {
    const mockClient1 = { id: '123' } as Socket;
    const mockClient2 = { id: '456' } as Socket;

    service.registerClient(mockClient1, 'user1');
    service.registerClient(mockClient2, 'user2');

    service.joinRoom(mockClient1, 'room1');
    service.joinRoom(mockClient2, 'room1');

    const clientsInRoom = service.getClientsInRoom('room1');
    expect(clientsInRoom).toEqual(['user1', 'user2']);
  });

  it('should return an empty array if the room does not exist', () => {
    const clientsInRoom = service.getClientsInRoom('nonexistentRoom');
    expect(clientsInRoom).toEqual([]);
  });
});
