import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-crear-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-paciente.component.html',
  styleUrl: './crear-paciente.component.css'
})
export class CrearPacienteComponent {

  pacienteService = inject(PacienteService);
  toast = inject(HotToastService);
  showConfirmationModal = signal(false);

 dataForm = signal(
    new FormGroup({
      nompaciente: new FormControl('', [Validators.required]),
      edadpaciente: new FormControl('', [Validators.required]),
      telpaciente: new FormControl(''),
      dirpaciente: new FormControl('', [Validators.required]),
      correopaciente: new FormControl('', [Validators.email]),
      ahfpaciente: new FormControl(''),
      apnppaciente: new FormControl(''),
      apppaciente: new FormControl(''),
      agopaciente: new FormControl(''),
      cardiacopaciente: new FormControl(''),
      respiratoriopaciente: new FormControl(''),
      digestivopaciente: new FormControl(''),
      pielytegumentospaciente: new FormControl(''),
      hemotipopaciente: new FormControl(''),
      terapeuticapaciente: new FormControl(''),
      pronosticopaciente: new FormControl(''),

    })
 )

 onSubmit() {
  if (this.dataForm().invalid) {
    this.dataForm().markAllAsTouched();
    return;
  }
  this.showConfirmationModal.set(true);

 }

 confirmCreatePaciente() {
  this.showConfirmationModal.set(false);
  if (this.dataForm().valid == true) {
    this.pacienteService.altaPaciente(this.dataForm().value)
      .subscribe({
        next: ( response ) => {
          this.toast.success('Paciente creado con éxito');
          this.pacienteService.updatePacientes()
        },
        error: ( error ) => {

          this.toast.error('No se pudo registrar, algo malo ocurrió', { dismissible: true });
        },
        complete: () => {
          this.dataForm().reset();
        }
      });
  }
 }

 cancelCreatePaciente() {
  this.showConfirmationModal.set(false);
 }

}
