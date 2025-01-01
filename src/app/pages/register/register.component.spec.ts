import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let authService: jest.Mocked<AuthService>;
  let router: jest.Mocked<Router>;
  let toastr: jest.Mocked<ToastrService>;

  beforeEach(() => {
    authService = {
      register: jest.fn()
    } as any;

    router = {
      navigate: jest.fn()
    } as any;

    toastr = {
      success: jest.fn(),
      error: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: toastr }
      ]
    });

    component = TestBed.createComponent(RegisterComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should mark all fields as touched if form is invalid', () => {
    component.registerForm.setValue({
      username: '',
      email: '',
      password: ''
    });

    component.onSubmit();

    expect(component.registerForm.touched).toBeTruthy();
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('should call authService.register and navigate to login on success', () => {
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });

    authService.register.mockReturnValue(of(void 0));

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(toastr.success).toHaveBeenCalledWith('Registro realizado com sucesso');
  });

  it('should show error toastr if email is already registered', () => {
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });

    const error = { status: 409, error: { message: 'Este email já tem um cadastro' } };
    authService.register.mockReturnValue(throwError(error));

    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith('Este email já tem um cadastro');
  });

  it('should show generic error toastr on other errors', () => {
    component.registerForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    });

    const error = { status: 500, error: 'Internal Server Error' };
    authService.register.mockReturnValue(throwError(error));

    component.onSubmit();

    expect(toastr.error).toHaveBeenCalledWith('Erro no registro', error);
  });
});
