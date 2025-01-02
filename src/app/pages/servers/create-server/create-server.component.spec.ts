import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateServerComponent } from './create-server.component';
import { ServerService } from '../../../services/server.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ServerResponseDTO } from '../../../model/server';

describe('CreateServerComponent', () => {
  let component: CreateServerComponent;
  let fixture: ComponentFixture<CreateServerComponent>;
  let mockServerService: jest.Mocked<ServerService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouter: jest.Mocked<Router>;
  let mockToastr: jest.Mocked<ToastrService>;

  beforeEach(async () => {
    mockServerService = {
      registerServer: jest.fn()
    } as unknown as jest.Mocked<ServerService>;

    mockAuthService = {
      isUserAuthorized: jest.fn()
    } as unknown as jest.Mocked<AuthService>;

    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    mockToastr = {
      success: jest.fn(),
      error: jest.fn()
    } as unknown as jest.Mocked<ToastrService>;

    await TestBed.configureTestingModule({
      imports: [
        CreateServerComponent,
        ReactiveFormsModule,
        MatInputModule,
        MatButtonModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: ServerService, useValue: mockServerService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('create component', () => {
    expect(component).toBeTruthy();
  });

  describe('form validations', () => {
    it('must be invalid when the server name is empty', () => {
      const serverNameControl = component.serverForm.get('serverName');

      serverNameControl?.setValue('');

      expect(serverNameControl?.hasError('required')).toBeTruthy();
    });

    it('should be invalid when the server name is less than 5 characters', () => {
      const serverNameControl = component.serverForm.get('serverName');

      serverNameControl?.setValue('test');

      expect(serverNameControl?.hasError('minlength')).toBeTruthy();
    });

    it('should be invalid when the server name is longer than 20 characters', () => {
      const serverNameControl = component.serverForm.get('serverName');
      const longName = 'um nome muito grande para o servidor';

      serverNameControl?.setValue(longName);

      expect(serverNameControl?.hasError('maxlength')).toBeTruthy();
    });

    it('valid form', () => {
      const serverNameControl = component.serverForm.get('serverName');
      const validName = 'Servidor Teste';

      serverNameControl?.setValue(validName);

      expect(serverNameControl?.valid).toBeTruthy();
    });
  });

  describe('onSubmit', () => {
    it('should not call the service if the form is invalid', () => {
      const serverNameControl = component.serverForm.get('serverName');
      serverNameControl?.setValue('');

      component.onSubmit();

      expect(mockServerService.registerServer).not.toHaveBeenCalled();
    });

    it('should show error if user is not authenticated', () => {
      mockAuthService.isUserAuthorized.mockReturnValue(false);
      component.serverForm.get('serverName')?.setValue('Servidor Teste');
      
      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith('Usuário não está autenticado. Por favor, faça login.');
      expect(mockServerService.registerServer).not.toHaveBeenCalled();
    });

    it('create the server successfully', () => {
      const serverName = 'Servidor Teste';
      const mockResponse: ServerResponseDTO = {
        id: '1',
        serverName: serverName,
        channels: [],
        createdAt: new Date().toISOString(),
      };
    
      mockAuthService.isUserAuthorized.mockReturnValue(true);
      mockServerService.registerServer.mockReturnValue(of(mockResponse));
      component.serverForm.get('serverName')?.setValue(serverName);
    
      component.onSubmit();
    
      expect(mockServerService.registerServer).toHaveBeenCalledWith(serverName);
      expect(mockToastr.success).toHaveBeenCalledWith(`Servidor "${serverName}" criado com sucesso.`);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/servers']);
      expect(component.serverForm.value.serverName).toBe('');
    });

    it('show error when failed to create server', () => {
      const errorMessage = 'Erro ao criar servidor';
      const serverName = 'Servidor Teste';
      
      mockAuthService.isUserAuthorized.mockReturnValue(true);
      mockServerService.registerServer.mockReturnValue(
        throwError(() => new Error(errorMessage))
      );
      component.serverForm.get('serverName')?.setValue(serverName);

      component.onSubmit();

      expect(mockToastr.error).toHaveBeenCalledWith(`Erro ao criar servidor: ${errorMessage}`);
    });
  });
});
