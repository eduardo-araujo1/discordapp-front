import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthGuardService } from './auth.guard.service';

class MockAuthService {
  getAuthorizationToken = jest.fn();
}

class MockRouter {
  navigate = jest.fn();
}

describe('AuthGuardService', () => {
  let authGuardService: AuthGuardService;
  let authServiceMock: MockAuthService;
  let routerMock: MockRouter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter }
      ]
    });

    authGuardService = TestBed.inject(AuthGuardService);
    authServiceMock = TestBed.inject(AuthService) as unknown as MockAuthService;
    routerMock = TestBed.inject(Router) as unknown as MockRouter;
  });

  it('should allow navigation if there is an authorization token', () => {
    authServiceMock.getAuthorizationToken.mockReturnValue('valid-token');
    
    const result = authGuardService.canActivate();

    expect(result).toBe(true);
  });

  it('should redirect to /login if there is no authorization token', () => {
    authServiceMock.getAuthorizationToken.mockReturnValue(null);

    const result = authGuardService.canActivate();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(result).toBe(false);
  });
});




