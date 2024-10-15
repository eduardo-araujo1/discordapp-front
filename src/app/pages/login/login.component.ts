import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.handleSuccessfulLogin(response.token);
      },
      error: (error) => {
        if (error.status === 401) {
          this.toastr.error('Email ou senha incorretos. Por favor, tente novamente.', 'Erro de Login');
        } else {
          this.toastr.error('Ocorreu um erro ao tentar fazer login. Por favor, tente novamente mais tarde.', 'Erro');
        }
      }
    });
  }

  private markAllAsTouched(): void {
    Object.values(this.loginForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private handleSuccessfulLogin(token: string): void {
    localStorage.setItem('token', token);
    this.router.navigate(['/servers']);
    this.toastr.success('Login realizado com sucesso!', 'Bem-vindo');
  }
}