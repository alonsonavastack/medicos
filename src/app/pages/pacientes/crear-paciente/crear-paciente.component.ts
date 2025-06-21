import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacienteService } from '../../../services/paciente.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { OdontogramaComponent } from '../../odontograma/odontograma.component';

@Component({
  selector: 'app-crear-paciente',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OdontogramaComponent],
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
      generopaciente: new FormControl(''),
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
      odontograma: new FormControl('') // Add the odontograma FormControl

    })
 )

 onSubmit() {
  if (this.dataForm().invalid) {
    this.dataForm().markAllAsTouched();
    return;
  }
  this.showConfirmationModal.set(true);

 }

 getOdontogramaData() {
  const formData = this.dataForm().value;
  return formData.odontograma || [];
}


 confirmCreatePaciente() {
   if (this.dataForm().valid) {
     const formData = this.dataForm().value;
     const odontogramaData = this.getOdontogramaData();
     
     const pacienteData = {
       ...formData,
       odontograma: odontogramaData || []
     };

     this.showConfirmationModal.set(false);

     this.pacienteService.altaPaciente(pacienteData).subscribe({
       next: (response) => {
        console.log('Paciente creado con éxito:', response);
         this.toast.success('Paciente creado con éxito');
         this.pacienteService.updatePacientes();
         this.dataForm().reset();
       },
       error: (error) => {
         console.error('Error al crear paciente:', error);
         this.toast.error('No se pudo registrar, algo malo ocurrió', { dismissible: true });
       }
     });
   }
 }

 cancelCreatePaciente() {
  this.showConfirmationModal.set(false);
 }

onOdontogramaChange(teeth: any): void {
  // Guarda los datos del odontograma en tu formulario
  this.dataForm().patchValue({
    odontograma: teeth
  });
  console.log('Datos actualizados del odontograma:', teeth);
}

}


