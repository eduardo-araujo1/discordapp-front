import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServerService } from '../../../services/server.service';
import { AuthService } from '../../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-create-server',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './create-server.component.html',
  styleUrl: './create-server.component.scss'
})
export class CreateServerComponent {
  serverForm: FormGroup;
  responseMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private serverService: ServerService,
    private authService: AuthService
  ) {
    this.serverForm = this.fb.group({
      serverName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    });
  }

  onSubmit() {
    if (this.serverForm.valid) {
      if (!this.authService.isUserAuthorized()) {
        this.responseMessage = 'Usuário não está autenticado. Por favor, faça login.';
        return;
      }

      const serverName = this.serverForm.get('serverName')?.value;
      this.serverService.registerServer(serverName)
        .subscribe({
          next: (response) => {
            this.responseMessage = `Servidor "${response.serverName}" criado com sucesso em ${response.createdAt}`;
            this.serverForm.reset();
          },
          error: (error) => {
            this.responseMessage = `Erro ao criar servidor: ${error.message}`;
          }
        });
    }
  }
}
