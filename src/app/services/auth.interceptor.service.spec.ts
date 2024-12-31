import { TestBed } from '@angular/core/testing';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpHeaders } from '@angular/common/http';
import { AuthInterceptorService } from './auth.interceptor.service';
import { Observable, of } from 'rxjs';

describe('AuthInterceptorService', () => {
  let localStorageMock: { [key: string]: string };
  let mockNext: HttpHandlerFn;
  
  beforeEach(() => {
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key] || null),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        })
      },
      writable: true
    });

    mockNext = jest.fn((req) => of({}) as Observable<HttpEvent<unknown>>);
  });

  it('should add Authorization header when token exists', () => {
    const token = 'mock-jwt-token';
    localStorageMock['token'] = token; 
    const request = new HttpRequest('GET', '/api/test', null);
    
    AuthInterceptorService(request, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    const modifiedRequest = (mockNext as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token does not exist', () => {
    const request = new HttpRequest('GET', '/api/test', null);
    
    AuthInterceptorService(request, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    const modifiedRequest = (mockNext as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBeFalsy();
  });

  it('should preserve existing headers when adding Authorization header', () => {
    const token = 'mock-jwt-token';
    localStorageMock['token'] = token;
  
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Custom-Header', 'test-value'); 

    const request = new HttpRequest('GET', '/api/test', null, { headers });
    
    
    AuthInterceptorService(request, mockNext);
    
  
    expect(mockNext).toHaveBeenCalled();
    const modifiedRequest = (mockNext as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(modifiedRequest.headers.get('Content-Type')).toBe('application/json');
    expect(modifiedRequest.headers.get('Custom-Header')).toBe('test-value');
  });

  it('should pass through the request without modification when token is empty string', () => {
    localStorageMock['token'] = '';
    const request = new HttpRequest('GET', '/api/test', null);
    
    AuthInterceptorService(request, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    const modifiedRequest = (mockNext as jest.Mock).mock.calls[0][0] as HttpRequest<unknown>;
    expect(modifiedRequest.headers.has('Authorization')).toBeFalsy();
  });

  it('should handle different HTTP methods', () => {
    const token = 'mock-jwt-token';
    localStorageMock['token'] = token;
    
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    
    methods.forEach(method => {
      const request = new HttpRequest(method, '/api/test', null);
      
      AuthInterceptorService(request, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      const modifiedRequest = (mockNext as jest.Mock).mock.calls.pop()[0] as HttpRequest<unknown>;
      expect(modifiedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
      expect(modifiedRequest.method).toBe(method);
    });
  });

  it('should return an Observable', () => {
    const request = new HttpRequest('GET', '/api/test', null);
    
    const result = AuthInterceptorService(request, mockNext);
    
    expect(result).toBeInstanceOf(Observable);
  });

  it('should forward the response from next handler', (done) => {
    const request = new HttpRequest('GET', '/api/test', null);
    const mockResponse = { status: 200, body: { data: 'test' } };
    mockNext = jest.fn(() => of(mockResponse)) as unknown as HttpHandlerFn;
    
    const result = AuthInterceptorService(request, mockNext);
    

    result.subscribe(response => {
      expect(response).toEqual(mockResponse);
      done();
    });
  });
});