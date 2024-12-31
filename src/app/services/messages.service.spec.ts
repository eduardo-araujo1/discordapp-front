import { MessagesService } from './messages.service';
import { MessageDTO } from '../model/message';

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => ({
    activate: jest.fn(),
    deactivate: jest.fn(),
    subscribe: jest.fn(),
    publish: jest.fn(),
    connected: true,
    onConnect: jest.fn(),
    onStompError: jest.fn(),
  })),
  Stomp: jest.fn(),
}));

jest.mock('sockjs-client', () => jest.fn().mockImplementation(() => ({
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
})));

describe('MessagesService', () => {
  let service: MessagesService;
  let clientPublishMock: jest.Mock;

  beforeEach(() => {
    service = new MessagesService();
    clientPublishMock = jest.fn();
    service.client.publish = clientPublishMock;
  });

  it('should send a message when sendMessage is called', () => {
    const message: MessageDTO = {
      content: 'Hello, world!',
      authorId: '123',
      authorName: 'Eduardo',
    };
    const serverId = 'server123';
    const channelId = 'channel123';
    
    service.sendMessage(serverId, channelId, message);

    expect(clientPublishMock).toHaveBeenCalledWith({
      destination: `/app/servers/${serverId}/channels/${channelId}/messages`,
      body: JSON.stringify(message),
    });
  });

  it('should log an error if parameters are invalid', () => {
    const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

    service.sendMessage('', '', null as any);

    expect(consoleErrorMock).toHaveBeenCalledWith('Parâmetros inválidos para enviar mensagem.');

    consoleErrorMock.mockRestore();
  });
});





