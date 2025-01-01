import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  private readonly dstRef = inject(DestroyRef)
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']); 
  }
  isUserAuthorized(): boolean {
    return this.auth.isUserAuthorized();
  }
}
