import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';

export const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path:'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
      { path: '', redirectTo: '/login', pathMatch: 'full' },
    ]
  }

];
