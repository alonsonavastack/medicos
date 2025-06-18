import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { LicenseValidationGuard } from './guards/license-validation.guard';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      // { path:'crear-pacientes', loadComponent: () => import('./pacientes/crear-paciente/crear-paciente.component').then(m => m.CrearPacienteComponent), canActivate:[LicenseValidationGuard] },
      // { path:'lista-pacientes', loadComponent: () => import('./pacientes/lista-paciente/lista-paciente.component').then(m => m.ListaPacienteComponent), canActivate:[LicenseValidationGuard]  },
      // { path:'crear-historial', loadComponent: () => import('./historial/crear-historial/crear-historial.component').then(m => m.CrearHistorialComponent), canActivate:[LicenseValidationGuard]  },
      // { path:'lista-historial', loadComponent: () => import('./historial/lista-historial/lista-historial.component').then(m => m.ListaHistorialComponent), canActivate:[LicenseValidationGuard]  },
      { path:'crear-pacientes', loadComponent: () => import('./pacientes/crear-paciente/crear-paciente.component').then(m => m.CrearPacienteComponent) },
      { path:'lista-pacientes', loadComponent: () => import('./pacientes/lista-paciente/lista-paciente.component').then(m => m.ListaPacienteComponent)  },
      { path:'crear-historial', loadComponent: () => import('./historial/crear-historial/crear-historial.component').then(m => m.CrearHistorialComponent)  },
      { path:'lista-historial', loadComponent: () => import('./historial/lista-historial/lista-historial.component').then(m => m.ListaHistorialComponent)  },

      { path:'licencia', loadComponent: () => import('./licencia/licencia.component').then(m => m.LicenciaComponent) },
      { path:'validar-licencia', loadComponent: () => import('./validarlicencia/validarlicencia.component').then(m => m.ValidarlicenciaComponent) },
      { path: '', redirectTo: '/crear-pacientes', pathMatch: 'full' },

    ]

  }
];
