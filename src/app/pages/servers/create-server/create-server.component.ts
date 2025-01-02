import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServerService } from '../../../services/server.service';
import { AuthService } from '../../../services/auth.service';
import { MatButtonModule } from '@angular/material/button';
import {MatInputModule} from '@angular/material/input'
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-create-server',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './create-server.component.html',
  styleUrl: './create-server.component.scss'
})
export class CreateServerComponent {
  serverForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private serverService: ServerService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.serverForm = this.fb.group({
      serverName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]]
    });
  }

  onSubmit() {
    if (this.serverForm.valid) {
      if (!this.authService.isUserAuthorized()) {
        this.toastr.error('Usuário não está autenticado. Por favor, faça login.');
        return;
      }

      const serverName = this.serverForm.get('serverName')?.value;

      this.serverService.registerServer(serverName).subscribe({
        next: (response) => {
          this.toastr.success(`Servidor "${response.serverName}" criado com sucesso.`);
          this.serverForm.reset({serverName: ''});
          this.router.navigate(['/servers']);
        },
        error: (error) => {
          this.toastr.error(`Erro ao criar servidor: ${error.message}`);
        }
      });
    } 
  }
}
