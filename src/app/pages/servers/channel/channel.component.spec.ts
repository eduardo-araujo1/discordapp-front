import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChannelComponent } from './channel.component';
import { ChannelService } from '../../../services/channel.service';
import { ActivatedRoute } from '@angular/router';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { of, Subscription, throwError } from 'rxjs';
import { ChannelResponseDTO } from '../../../model/channel';
import { MessageDTO } from '../../../model/message';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('ChannelComponent', () => {
  let component: ChannelComponent;
  let fixture: ComponentFixture<ChannelComponent>;
  let channelServiceMock: jest.Mocked<ChannelService>;
  let messagesServiceMock: jest.Mocked<MessagesService>;
  let authServiceMock: jest.Mocked<AuthService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let activatedRouteMock: jest.Mocked<ActivatedRoute>;

  const mockChannel: ChannelResponseDTO = {
    channelId: '1',
    name: 'General',
  };

  const mockMessages: MessageDTO[] = [
    {
      id: '1',
      content: 'Hello',
      authorId: '1',
      authorName: 'User1',
      timestamp: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      content: 'Hi',
      authorId: '2',
      authorName: 'User2',
      timestamp: '2024-01-01T00:01:00Z'
    }
  ];

  beforeEach(async () => {
    // Mock dos serviços
    channelServiceMock = {
      getMessages: jest.fn().mockReturnValue(of(mockMessages)),
      findChannelsById: jest.fn().mockReturnValue(of(mockChannel))
    } as any;

    messagesServiceMock = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      sendMessage: jest.fn(),
      getMessages: jest.fn().mockReturnValue(of(mockMessages))
    } as any;

    authServiceMock = {
      getUserId: jest.fn().mockReturnValue('1')
    } as any;

    toastrServiceMock = {
      error: jest.fn()
    } as any;

    activatedRouteMock = {
      paramMap: of({
        get: jest.fn((key: string) => {
          switch (key) {
            case 'id': return '1';
            case 'channelId': return '1';
            default: return null;
          }
        })
      })
    } as any;

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ChannelComponent], // Importe o componente standalone
      providers: [
        { provide: ChannelService, useValue: channelServiceMock },
        { provide: MessagesService, useValue: messagesServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages and channel on initialization', () => {
    // Arrange
    const serverId = '1';
    const channelId = '1';

    // Act
    component.ngOnInit();

    // Assert
    expect(channelServiceMock.getMessages).toHaveBeenCalledWith(serverId, channelId);
    expect(channelServiceMock.findChannelsById).toHaveBeenCalledWith(serverId, channelId);
    expect(component.messages).toEqual(mockMessages);
    expect(component.channel).toEqual(mockChannel);
  });

  it('should handle error when loading messages fails', () => {
    // Arrange
    const error = new Error('Failed to load messages');
    channelServiceMock.getMessages.mockReturnValue(throwError(() => error));

    // Act
    component.ngOnInit();

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith('Erro ao carregar mensagens antigas');
  });

  it('should handle error when loading channel fails', () => {
    // Arrange
    const error = new Error('Failed to load channel');
    channelServiceMock.findChannelsById.mockReturnValue(throwError(() => error));

    // Act
    component.ngOnInit();

    // Assert
    expect(toastrServiceMock.error).toHaveBeenCalledWith('Erro ao carregar o canal. Detalhes: ' + error.message);
  });

  it('should initialize WebSocket connection', () => {
    // Arrange
    const serverId = '1';
    const channelId = '1';

    // Act
    component.ngOnInit();

    // Assert
    expect(messagesServiceMock.connect).toHaveBeenCalledWith(serverId, channelId);
    expect(messagesServiceMock.getMessages).toHaveBeenCalled();
  });

  it('should send a message', () => {
    // Arrange
    component.newMessage = 'Hello, World!';
    component.serverId = '1';
    component.channelId = '1';
    component.userId = '1';

    const expectedMessage: MessageDTO = {
      content: 'Hello, World!',
      authorId: '1',
      authorName: null,
      timestamp: expect.any(String)
    };

    // Act
    component.sendMessage();

    // Assert
    expect(messagesServiceMock.sendMessage).toHaveBeenCalledWith('1', '1', expectedMessage);
    expect(component.newMessage).toBe('');
  });

  it('should not send a message if newMessage is empty', () => {
    // Arrange
    component.newMessage = '';
    component.serverId = '1';
    component.channelId = '1';
    component.userId = '1';

    // Act
    component.sendMessage();

    // Assert
    expect(messagesServiceMock.sendMessage).not.toHaveBeenCalled();
  });

  it('should unsubscribe and disconnect on destroy', () => {
    // Arrange
    const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');
    const disconnectSpy = jest.spyOn(messagesServiceMock, 'disconnect');
  
    // Simula a inicialização do componente e a criação da subscription
    component.ngOnInit(); // Isso deve inicializar `messagesSubscription`
    expect(component['messagesSubscription']).toBeTruthy(); // Verifica se a subscription foi criada
  
    // Act
    component.ngOnDestroy();
  
    // Assert
    expect(unsubscribeSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});