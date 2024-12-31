import { TestBed } from '@angular/core/testing';
import { provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting,} from '@angular/common/http/testing';
import { ServerService } from './server.service';
import { AuthService } from './auth.service';
import { ServerRequestDTO, ServerResponseDTO } from '../model/server';

describe('ServerService', () => {
  let service: ServerService;
  let httpMock: HttpTestingController;
  let authServiceMock: jest.Mocked<AuthService>;
  
  const apiUrl = 'http://localhost:8080/servers';
  
  const mockUserId = 'user123';
  const mockToken = 'mock-jwt-token';
  
  const mockServerResponse: ServerResponseDTO = {
    id: 'server123',
    serverName: 'Test Server',
    channels: [],
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    authServiceMock = {
      getUserId: jest.fn(),
      getAuthorizationToken: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ServerService,
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(ServerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('registerServer', () => {
    it('should successfully register a new server', () => {
      const serverName = 'Test Server';
      authServiceMock.getUserId.mockReturnValue(mockUserId);
      authServiceMock.getAuthorizationToken.mockReturnValue(mockToken);

      const expectedRequest: ServerRequestDTO = {
        serverName,
        userId: mockUserId
      };

      service.registerServer(serverName).subscribe(response => {
        expect(response).toEqual(mockServerResponse);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedRequest);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush(mockServerResponse);
    });

    it('should return error when user is not authenticated', (done) => {
      authServiceMock.getUserId.mockReturnValue(null);

      service.registerServer('Test Server').subscribe({
        error: (error) => {
          expect(error.message).toBe('Usuário não autenticado');
          done();
        }
      });
      httpMock.expectNone(apiUrl);
    });

    it('should handle server error response', () => {
      const serverName = 'Test Server';
      authServiceMock.getUserId.mockReturnValue(mockUserId);
      authServiceMock.getAuthorizationToken.mockReturnValue(mockToken);

      service.registerServer(serverName).subscribe({
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('findAll', () => {
    it('should return all servers', () => {
      const mockServers: ServerResponseDTO[] = [
        mockServerResponse,
        { ...mockServerResponse, id: 'server456', serverName: 'Another Server' }
      ];

      service.findAll().subscribe(servers => {
        expect(servers).toEqual(mockServers);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockServers);
    });

    it('should handle error when fetching all servers fails', () => {
      service.findAll().subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('findById', () => {
    it('should return a specific server by ID', () => {
      const serverId = 'server123';

      service.findById(serverId).subscribe(server => {
        expect(server).toEqual(mockServerResponse);
      });

      const req = httpMock.expectOne(`${apiUrl}/${serverId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockServerResponse);
    });

    it('should handle error when server is not found', () => {
      const serverId = 'nonexistent';

      service.findById(serverId).subscribe({
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${serverId}`);
      req.flush('Server not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
