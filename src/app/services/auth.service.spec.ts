import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResponseDTO, RegisterDTO } from '../model/auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/auth';

  class LocalStorageMock {
    private store: { [key: string]: string } = {};
    
    getItem = jest.fn((key: string) => this.store[key] || null);
    setItem = jest.fn((key: string, value: string) => { this.store[key] = value; });
    removeItem = jest.fn((key: string) => { delete this.store[key]; });
    clear = jest.fn(() => { this.store = {}; });
  }

  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorageMock.clear();
  });

  const mockLoginRequest = (loginDto: LoginDTO) => {
    const request = httpMock.expectOne(`${apiUrl}/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(loginDto);
    return request;
  };

  const mockRegisterRequest = (registerDto: RegisterDTO) => {
    const request = httpMock.expectOne(`${apiUrl}/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(registerDto);
    return request;
  };

  describe('login', () => {
    const loginDto: LoginDTO = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully login', () => {
      const mockResponse: LoginResponseDTO = { token: 'mock-jwt-token' };
      
      service.login(loginDto).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });
      
      mockLoginRequest(loginDto).flush(mockResponse);
    });

    it('should handle login error', () => {
      service.login(loginDto).subscribe({
        error: (error) => {
          expect(error.status).toBe(401);
          expect(error.statusText).toBe('Unauthorized');
        }
      });

      mockLoginRequest(loginDto).flush(
        'Invalid credentials', 
        { status: 401, statusText: 'Unauthorized' }
      );
    });
  });

  describe('register', () => {
    const registerDto: RegisterDTO = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should successfully register user', () => {
      service.register(registerDto).subscribe(response => {
        expect(response).toBeUndefined();
      });
      
      mockRegisterRequest(registerDto).flush(null);
    });

    it('should handle registration error', () => {
      service.register(registerDto).subscribe({
        error: (error) => {
          expect(error.status).toBe(409);
          expect(error.statusText).toBe('Conflict');
        }
      });

      mockRegisterRequest(registerDto).flush(
        'User already exists',
        { status: 409, statusText: 'Conflict' }
      );
    });
  });

  describe('token management', () => {
    const mockToken = 'mock-jwt-token';
    const mockUserId = '123456';

    beforeEach(() => {
      localStorageMock.setItem('token', mockToken);
    });

    it('should get authorization token', () => {
      expect(service.getAuthorizationToken()).toBe(mockToken);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });


    it('should decode token and return userId', () => {
      const encodedToken = `header.${btoa(JSON.stringify({ userId: mockUserId }))}.signature`;
      localStorageMock.setItem('token', encodedToken);
      
      expect(service.getUserId()).toBe(mockUserId);
    });

    it('should return null when no token exists for getUserId', () => {
      localStorageMock.removeItem('token');
      expect(service.getUserId()).toBeNull();
    });

    it('should handle logout', () => {
      service.logout();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });
});
