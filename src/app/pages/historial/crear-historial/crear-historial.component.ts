import { Component, inject, signal } from '@angular/core';
import { PacienteService } from '../../../services/paciente.service';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-crear-historial',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-historial.component.html',
  styleUrl: './crear-historial.component.css',
})
export class CrearHistorialComponent {
  pacienteService = inject(PacienteService);
  toast = inject(HotToastService);
  date = new Date();
  pacientes = this.pacienteService.pacientes;
  showConfirmationModal = signal(false);

  dataForm = signal(
    new FormGroup({
      pesohistorial: new FormControl('', [Validators.required]),
      tallahistorial: new FormControl('', [Validators.required]),
      fchistorial: new FormControl('', [Validators.required]),
      citahistorial: new FormControl('', [Validators.required]),
      idpaciente: new FormControl('', [Validators.required]),
      fechahistorial: new FormControl(this.date.toLocaleDateString()),
      diagnostico: new FormControl('', [Validators.required]),
    })
  );

  onSubmit() {
    if (this.dataForm().invalid) {
      this.dataForm().markAllAsTouched();
      return;
    }
    this.showConfirmationModal.set(true);
  }

  confirmCreateHistorial() {
    this.showConfirmationModal.set(false);
    if (this.dataForm().valid == true) {
      this.pacienteService.altaHistorial(this.dataForm().value).subscribe({
        next: (resp) => {
          this.toast.success('Historial creado correctamente');
        },
        error: (err) => {
          this.toast.error('No se pudo registrar, algo salió mal', {
            dismissible: true,
          });
        },
      });
    }
  }

  cancelCreateHistorial() {
    this.showConfirmationModal.set(false);
  }
}
