import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuardService } from './services/auth.guard.service';

export const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},

  {path: 'login', loadChildren: () => import('./pages/login/login.routes').then(r => r.LOGIN_ROUTES)},
  {path: 'register', loadChildren: () => import('./pages/register/register.routes').then(r => r.REGISTER_ROUTES)},
  {
    path: 'servers', loadChildren: () => import('./pages/servers/servers.routes').then(r => r.SERVER_ROUTES),
    canActivate: [AuthGuardService]
  },
];
