import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../services/auth.service';
import { DestroyRef } from '@angular/core';
import { Subject } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let activatedRoute: jest.Mocked<ActivatedRoute>;

  beforeEach(() => {
    authService = {
      logout: jest.fn(),
      isUserAuthorized: jest.fn()
    } as any;

    router = {
      navigate: jest.fn(),
      events: new Subject()
    } as any;

    activatedRoute = {} as any; 

    TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute }, 
        { provide: DestroyRef, useValue: {} } 
      ]
    });

    component = TestBed.createComponent(NavbarComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.logout and navigate to home on logout', () => {
    component.logout();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('return true if user is authorized', () => {
    authService.isUserAuthorized.mockReturnValue(true);

    const result = component.isUserAuthorized();

    expect(result).toBe(true);
    expect(authService.isUserAuthorized).toHaveBeenCalled();
  });

  it('should return false if user is not authorized', () => {
    authService.isUserAuthorized.mockReturnValue(false);

    const result = component.isUserAuthorized();

    expect(result).toBe(false);
    expect(authService.isUserAuthorized).toHaveBeenCalled();
  });
});
