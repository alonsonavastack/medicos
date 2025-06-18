import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../../../services/paciente.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  formValid = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  pacientesService = inject(PacienteService);
  router = inject(Router);
  toast = inject(HotToastService);

  ngOnInit() {
    this.formValid = new FormGroup({
      email: new FormControl('alonso@gmail.com', [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit() {
    if (this.formValid.invalid) {
      this.formValid.markAllAsTouched();
      return;
    }
    const emailValue = this.formValid.get('email')?.value;

    this.pacientesService.login(this.formValid.value).subscribe({
      next: (response: any) => {
        if (response.error) {
          this.toast.error(response.error, {
            dismissible: true,
          });
        } else {

          if(typeof emailValue === 'string') {
             localStorage.setItem('email', emailValue);
          }
          this.router.navigateByUrl('lista-pacientes');
          this.toast.success('Bienvenido', {
            dismissible: true,
          });
        }
      },
      error: (error: HttpErrorResponse) => {
        this.toast.error('Error en la conexión o consulte al administrador', {
          dismissible: true,
        });
      },
    });
  }
}
