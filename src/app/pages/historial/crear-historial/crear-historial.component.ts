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
import '@angular/compiler';
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
  showModal: boolean = false;
  showConfirmation: boolean = false;
  listPacientes: any[] = [];
  selectedPatient: any | null = null;
  searchText: string = '';
  filteredPacientes: any[] = [];
  selectedPatientId: number | null = null; // To store the selected patient's ID
  recipeImagePreview = signal<string | ArrayBuffer | null>(null); // Signal for image preview

  dataForm = signal(
    new FormGroup({
      pesohistorial: new FormControl('', [Validators.required]),
      tallahistorial: new FormControl(''),
      fchistorial: new FormControl(''),
      citahistorial: new FormControl(''),
      frhistorial: new FormControl(''),
      tahistorial: new FormControl(''),
      spohistorial: new FormControl(''),
      alergiashistorial: new FormControl(''),
      idpaciente: new FormControl(null, [Validators.required]),
      fechahistorial: new FormControl(this.date.toLocaleDateString()),
      diagnostico: new FormControl('', [Validators.required]),
      recipeImage: new FormControl<File | null>(null)
    })
  );

 onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.dataForm().patchValue({ recipeImage: file });
      this.dataForm().get('recipeImage')?.updateValueAndValidity();

      // Generate preview
      const reader = new FileReader();
      reader.onload = () => {
        this.recipeImagePreview.set(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      this.recipeImagePreview.set(null); // Clear preview if no file is selected
    }
  }

  onSubmit() {
    if (this.dataForm().invalid) {
      this.toast.warning('Por favor, complete todos los campos obligatorios.', { dismissible: true });
      this.dataForm().markAllAsTouched();
      return;
    }
    this.showConfirmationModal.set(true);
  }

  confirmCreateHistorial() {
    this.showConfirmationModal.set(false);
    if (this.dataForm().valid) {
        const formData = new FormData();
        
        Object.keys(this.dataForm().controls).forEach(key => {
            const control = this.dataForm().get(key);
            if (control && control.value !== null && control.value !== undefined) {
                if (key === 'recipeImage' && control.value instanceof File) {
                    formData.append(key, control.value, control.value.name);
                } else {
                    formData.append(key, control.value);
                }
            }
        });

        this.pacienteService.altaHistorial(formData).subscribe({
            next: (resp: any) => {
                if (resp.body?.resultado === 'OK') {
                    this.toast.success('Historial creado correctamente');
                    this.pacienteService.updateHistorial();
                    this.resetForm();
                } else {
                    this.toast.error(resp.body?.mensaje || 'Error desconocido al crear historial');
                }
            },
            error: (err) => {
                console.error('Error completo:', err);
                this.toast.error(`Error al registrar: ${err.message || 'Error de conexión'}`);
            }
        });
    }
}

resetForm() {
    this.dataForm().reset();
    this.recipeImagePreview.set(null);
    const inputElement = document.getElementById('idpaciente') as HTMLInputElement;
    if (inputElement) inputElement.value = '';
}

  cancelCreateHistorial() {
    this.showConfirmationModal.set(false);
  }

  selectPatient(item: any) {
    this.selectedPatientId = item.idpaciente; // Store the patient ID
    this.dataForm().patchValue({
      idpaciente: item.idpaciente,
    });
    const inputElement = document.getElementById('idpaciente') as HTMLInputElement;
    if(inputElement){
      inputElement.value = item.nompaciente;
    }
    this.closeModal(); // Close the modal after selection
  }


  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  filteredPacientesList() {
    if (!this.searchText) {
      return this.pacientes();
    }
    const search = this.searchText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

      return this.pacientes().filter((item: any) => {

        const nompaciente = item.nompaciente
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

          return nompaciente.includes(search);
      });
  }

  filterPacientes(){
    if (!this.searchText) {
      this.filteredPacientes = [...this.listPacientes];
      return;
    }
    this.filteredPacientes = this.listPacientes.filter(paciente=> paciente.nompaciente.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  resetPacientes(){
    this.searchText = '';
  }


}
