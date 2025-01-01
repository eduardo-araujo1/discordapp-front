import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError, Subject } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;
  let activatedRoute: jest.Mocked<ActivatedRoute>;

  beforeEach(() => {
    authService = {
      login: jest.fn()
    } as any;

    router = {
      navigate: jest.fn(),
      events: new Subject()
    } as any;

    toastr = {
      success: jest.fn(),
      error: jest.fn()
    } as any;

    activatedRoute = {} as any;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, LoginComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    });

    component = TestBed.createComponent(LoginComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should mark all fields as touched if form is invalid', () => {
      component.loginForm.setValue({
        email: '',
        password: ''
      });

      component.onSubmit();

      expect(component.loginForm.touched).toBeTruthy();
      expect(authService.login).not.toHaveBeenCalled();
    });
  });

  describe('Successful Login', () => {
    it('should call authService.login and handle successful login', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      const mockResponse = { token: 'fake-token' };
      authService.login.mockReturnValue(of(mockResponse));

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(router.navigate).toHaveBeenCalledWith(['/servers']);
      expect(toastr.success).toHaveBeenCalledWith('Login realizado com sucesso!', 'Bem-vindo');
    });
  });

  describe('Failed Login', () => {
    it('should show error toastr if login fails with 401 status', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      const error = { status: 401 };
      authService.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(toastr.error).toHaveBeenCalledWith(
        'Email ou senha incorretos. Por favor, tente novamente.',
        'Erro de Login'
      );
    });

    it('should show generic error toastr on other errors', () => {
      component.loginForm.setValue({
        email: 'test@example.com',
        password: 'password123'
      });

      const error = { status: 500 };
      authService.login.mockReturnValue(throwError(() => error));

      component.onSubmit();

      expect(toastr.error).toHaveBeenCalledWith(
        'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.',
        'Erro'
      );
    });
  });
});