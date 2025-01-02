import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServersComponent } from './servers.component';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { of, throwError } from 'rxjs';
import { ServerService } from '../../services/server.service';
import { ServerResponseDTO } from '../../model/server';

describe('ServersComponent', () => {
  let component: ServersComponent;
  let fixture: ComponentFixture<ServersComponent>;
  let serverServiceMock: jest.Mocked<ServerService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;

  const mockServers: ServerResponseDTO[] = [
    {
      id: '1',
      serverName: 'Server 1',
      channels: [],
      createdAt: '2024-12-01T12:00:00Z'
    },
    {
      id: '2',
      serverName: 'Server 2',
      channels: [],
      createdAt: '2024-12-02T12:00:00Z'
    }
  ];

  beforeEach(async () => {
    serverServiceMock = {
      findAll: jest.fn().mockReturnValue(of(mockServers))
    } as any;

    toastrServiceMock = {
      error: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterLink,
        MatCardModule,
        MatListModule,
        MatIconModule
      ],
      providers: [
        { provide: ServerService, useValue: serverServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ServersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call loadServers on initialization', () => {
      const loadServersSpy = jest.spyOn(component, 'loadServers');
      
      component.ngOnInit();
      
      expect(loadServersSpy).toHaveBeenCalled();
    });
  });

  describe('loadServers', () => {
    it('should load servers successfully', () => {
      serverServiceMock.findAll.mockReturnValue(of(mockServers));
      
      component.loadServers();
      
      expect(serverServiceMock.findAll).toHaveBeenCalled();
      expect(component.servers).toEqual(mockServers); 
    });

    it('should handle error when loading servers fails', () => {
      const error = new Error('Server error');
      serverServiceMock.findAll.mockReturnValue(throwError(() => error)); 
      
      component.loadServers();
      
      expect(serverServiceMock.findAll).toHaveBeenCalled();
      expect(toastrServiceMock.error).toHaveBeenCalledWith('Erro ao carregar os servidores');
    });
  });
});

