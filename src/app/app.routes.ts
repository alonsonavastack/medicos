import { Routes } from '@angular/router';
import { authGuard } from './pages/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canMatch: [authGuard],
    loadChildren: () => import('./pages/dashboard.routes').then(m => m.routes),

  },
  { path: '**', redirectTo: '/login', pathMatch: 'full' },
];
