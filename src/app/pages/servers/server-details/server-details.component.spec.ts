import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ServerDetailsComponent } from './server-details.component';
import { ServerService } from '../../../services/server.service';
import { ChannelService } from '../../../services/channel.service';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ServerResponseDTO } from '../../../model/server';
import { ChannelResponseDTO } from '../../../model/channel';

describe('ServerDetailsComponent', () => {
  let component: ServerDetailsComponent;
  let mockServerService: jest.Mocked<ServerService>;
  let mockChannelService: jest.Mocked<ChannelService>;
  let mockToastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    mockServerService = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<ServerService>;

    mockChannelService = {
      createChannel: jest.fn(),
    } as unknown as jest.Mocked<ChannelService>;

    mockToastr = {
      success: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ToastrService>;

    const mockActivatedRoute = {
      paramMap: of({ 
        get: (param: string) => param === 'id' ? '123' : null,
        has: (param: string) => param === 'id',
        getAll: () => [],
        keys: []
      }),
      snapshot: {
        paramMap: {
          get: (param: string) => param === 'id' ? '123' : null
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        ServerDetailsComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule,
        MatListModule,
        MatIconModule,
        MatFormFieldModule,
      ],
      providers: [
        { provide: ServerService, useValue: mockServerService },
        { provide: ChannelService, useValue: mockChannelService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServerDetailsComponent);
    component = fixture.componentInstance;
  });

  it('deve carregar os detalhes do servidor ao inicializar', () => {
    // Arrange
    const mockServerData: ServerResponseDTO = {
      id: '123',
      serverName: 'Servidor Teste',
      channels: [],
      createdAt: new Date().toISOString(),
    };
    mockServerService.findById.mockReturnValue(of(mockServerData));

    // Act
    component.ngOnInit();

    // Assert
    expect(mockServerService.findById).toHaveBeenCalledWith('123');
    expect(component.server).toEqual(mockServerData);
  });

  it('deve exibir erro ao falhar em carregar os detalhes do servidor', () => {
    // Arrange
    mockServerService.findById.mockReturnValue(throwError(() => new Error('Erro de servidor')));

    // Act
    component.ngOnInit();

    // Assert
    expect(mockToastr.error).toHaveBeenCalledWith('Erro ao carregar o servidor: Erro de servidor');
  });

  it('deve criar um novo canal com sucesso', () => {
    // Arrange
    const mockServerData: ServerResponseDTO = {
      id: '123',
      serverName: 'Servidor Teste',
      channels: [],
      createdAt: new Date().toISOString(),
    };
    const mockNewChannel: ChannelResponseDTO = {
      channelId: '1',
      name: 'Novo Canal',
    };
    component.server = mockServerData;

    mockChannelService.createChannel.mockReturnValue(of(mockNewChannel));

    component.channelForm.setValue({ newChannelName: 'Novo Canal' });

    // Act
    component.createChannel();

    // Assert
    expect(mockChannelService.createChannel).toHaveBeenCalledWith('123', { name: 'Novo Canal' });
    expect(component.server.channels).toContain(mockNewChannel);
    expect(mockToastr.success).toHaveBeenCalledWith('Canal "Novo Canal" criado com sucesso!');
  });

  it('deve exibir erro ao falhar na criação de um canal', () => {
    // Arrange
    const mockServerData: ServerResponseDTO = {
      id: '123',
      serverName: 'Servidor Teste',
      channels: [],
      createdAt: new Date().toISOString(),
    };
    component.server = mockServerData;

    mockChannelService.createChannel.mockReturnValue(throwError(() => new Error('Erro ao criar')));

    component.channelForm.setValue({ newChannelName: 'Novo Canal' });

    // Act
    component.createChannel();

    // Assert
    expect(mockChannelService.createChannel).toHaveBeenCalledWith('123', { name: 'Novo Canal' });
    expect(mockToastr.error).toHaveBeenCalledWith('Erro ao criar o canal: Erro ao criar');
  });

  it('não deve criar um canal se o formulário for inválido', () => {
    // Arrange
    component.channelForm.setValue({ newChannelName: '' }); // Formulário inválido

    // Act
    component.createChannel();

    // Assert
    expect(mockChannelService.createChannel).not.toHaveBeenCalled();
    expect(mockToastr.error).not.toHaveBeenCalled();
  });
});
