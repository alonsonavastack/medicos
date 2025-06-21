import { Component, computed, effect, inject, signal } from '@angular/core';
import { PacienteService } from '../../../services/paciente.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-lista-historial',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-historial.component.html',
  styleUrl: './lista-historial.component.css'
})
export class ListaHistorialComponent {
  pacientesService = inject(PacienteService);
  toast = inject(HotToastService);

  private _allHistorial = this.pacientesService.historial;
  historial = signal<any[]>([]);
  pacientes = this.pacientesService.pacientes;

  sortBy = signal<keyof any>('nompaciente');
  sortOrder = signal<'asc' | 'desc'>('asc');
  showModalboolean: boolean = false;
  showConfirmation: boolean = false;

  showModal = signal(false);
  showVerModal = signal(false);
  showConfirmationModal = signal(false);
  showDelete = signal(false);
  idHistorialToDelete = signal<number>(0)
  filteredPacientes: any[] = [];
  selectedPatientId: number | null = null; // To store the selected patient's ID
  listPacientes: any[] = [];
  date = new Date();

  selectedRecipeImageFile: File | null = null;
  currentRecipeImagePreview = signal<string | ArrayBuffer | null>(null);

  dataForm = signal(
    new FormGroup({
      idhistorial: new FormControl(''),
      nompaciente: new FormControl('', Validators.required),
      pesohistorial: new FormControl('', [Validators.required]),
      tallahistorial: new FormControl(''),
      fchistorial: new FormControl(''),
      citahistorial: new FormControl('', [Validators.required]),
      frhistorial: new FormControl(''),
      tahistorial: new FormControl(''),
      spohistorial: new FormControl(''),
      alergiashistorial: new FormControl(''),
      idpaciente: new FormControl(null, [Validators.required]),
      fechahistorial: new FormControl(this.date.toLocaleDateString()),
      diagnostico: new FormControl('', [Validators.required]),
    })
  );

  isLoading = this.pacientesService.isLoadingHistorial
  searchText: string = '';
  constructor() {
    this.dataForm = signal(
      new FormGroup({
        idhistorial: new FormControl(''),
        nompaciente: new FormControl(''),
        pesohistorial: new FormControl('', [Validators.required]),
        tallahistorial: new FormControl(''),
        fchistorial: new FormControl(''),
        citahistorial: new FormControl('', [Validators.required]),
        frhistorial: new FormControl(''),
        tahistorial: new FormControl(''),
        spohistorial: new FormControl(''),
        alergiashistorial: new FormControl(''),
        idpaciente: new FormControl(null, [Validators.required]),
        fechahistorial: new FormControl(this.date.toLocaleDateString()),
        diagnostico: new FormControl('', [Validators.required]),
      })
    );
    effect(() => {
      this.historial.set(this._allHistorial());

    });
  }

  onFileSelectedForEdit(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedRecipeImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.currentRecipeImagePreview.set(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedRecipeImageFile = null;
      // If you want to clear preview when file is deselected from input
      // this.currentRecipeImagePreview.set(this.dataForm().get('recipeImage')?.value || null); 
    }
  }

  onEditHistorial(item: any) {
    this.showModal.set(true);
    this.dataForm().patchValue(item);
    this.selectedRecipeImageFile = null; // Reset selected file for edit
    if (item.recipeImage) {
      // Assuming item.recipeImage is a relative path like 'imagenes/receta/...'
      // You need to construct the full URL if it's not already.
      // For local XAMPP, it might be:
      this.currentRecipeImagePreview.set(`${this.pacientesService.base_url}${item.recipeImage}`);
    } else {
      this.currentRecipeImagePreview.set(null);
    }
  }

  onVerHistorial(item: any) {
    this.showVerModal.set(true);
    this.dataForm().patchValue(item);
    // this.selectedHistorial.set(item);
  }

  onCloseModal() {
    this.showModal.set(false);
    this.currentRecipeImagePreview.set(null); // Clear preview on close
    this.selectedRecipeImageFile = null;
  }

  onCloseVerModal() {
    this.showVerModal.set(false);
  }

  onSubmit() {
    if (this.dataForm().invalid) {
      this.toast.warning('Por favor, complete todos los campos', { dismissible: true });
      this.dataForm().markAllAsTouched();
      return;
    }
    this.showConfirmationModal.set(true);
  }

  confirmEditHistorial() {
    this.showConfirmationModal.set(false);
    if (this.dataForm().valid) {
      const formValue = this.dataForm().value;
      // The 'recipeImage' field in dataForm might hold the old path string.
      // We don't want to send that string as a file.
      // The actual file is in this.selectedRecipeImageFile

      // Create a clean data object without the recipeImage form control value
      const dataToSend: any = {};
      Object.keys(formValue).forEach(key => {
        if (key !== 'recipeImage') { // Exclude the recipeImage form control value
          dataToSend[key] = (formValue as any)[key];
        }
      });
      // Ensure idhistorial is included
      if (!dataToSend.idhistorial && this.dataForm().get('idhistorial')?.value) {
        dataToSend.idhistorial = this.dataForm().get('idhistorial')?.value;
      }

      this.pacientesService.editarHistorial(dataToSend, this.selectedRecipeImageFile).subscribe({
        next: (response: any) => { // Type as HttpResponse<any> if using observe: 'response'
          if (response.body?.resultado === 'OK') { // Access body for actual response
            this.toast.success('Historial actualizado con éxito');
            this.showModal.set(false);
            this.pacientesService.refetchHistorial();
            this.currentRecipeImagePreview.set(null);
            this.selectedRecipeImageFile = null;
          } else {
            this.toast.error(response.body?.mensaje || 'Error desconocido al actualizar historial');
          }
        },
        error: (err) => {
          console.error('Error completo en edición:', err);
          let errorMessage = 'Error de conexión o del servidor.';
          if (err.error && typeof err.error.mensaje === 'string') {
            errorMessage = err.error.mensaje;
          } else if (typeof err.message === 'string') {
            errorMessage = err.message;
          }
          this.toast.error(`Error al actualizar: ${errorMessage}`);
        },
      });
    } else {
      this.toast.warning('Formulario inválido.');
    }
  }

  cancelEditHistorial() {
    this.showConfirmationModal.set(false);
  }

  showDeleteModal(idhistorial: any) {
    this.showDelete.set(true);
    this.idHistorialToDelete.set(idhistorial)
  }

  confirmDeleteHistorial() {
    this.showDelete.set(false);
    this.pacientesService.eliminarHistorial(this.idHistorialToDelete())
      .subscribe({
        next: (response: any) => {
          this.toast.success('Historial eliminado con éxito', {
            dismissible: true,
          });
          this.pacientesService.refetchHistorial();
        },
        error: (error) => {
          this.toast.error('No se pudo eliminar el historial', {
            dismissible: true,
          });
          console.log(error);
        },
        complete: () => {
          console.log('Historial eliminado');
        }
      })
  }

  onDeleteHistorial(idhistorial: number) {
    this.showDelete.set(true);

  }

  cancelDeleteHistorial() {
    this.showDelete.set(false);
  }

  seleccionarReceta(idhistorial: any) {
    this.pacientesService.seleccionarReceta(idhistorial)
  }

  filteredHistorialList() {
    if (!this.searchText) {
      return this.historial();
    }
    const search = this.searchText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    return this.historial().filter((item) => {

      const nompaciente = item.nompaciente
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return nompaciente.includes(search);
    });
  }



  resetHistorial() {
    this.searchText = '';
  }

  openModal() {
    this.showModalboolean = true;
  }

  closeModal() {
    this.showModalboolean = false;
  }

  selectPatient(item: any) {
    this.selectedPatientId = item.idpaciente; // Store the patient ID
    this.dataForm().patchValue({
      idpaciente: item.idpaciente,
      nompaciente: item.nompaciente, // Update the nompaciente form control

    });
    const inputElement = document.getElementById('idpaciente') as HTMLInputElement;
    if (inputElement) {
      inputElement.value = item.nompaciente;
    }
    this.closeModal(); // Close the modal after selection
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

  filterPacientes() {
    if (!this.searchText) {
      this.filteredPacientes = [...this.listPacientes];
      return;
    }
    this.filteredPacientes = this.listPacientes.filter(paciente => paciente.nompaciente.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  resetPacientes() {
    this.searchText = '';
  }



}
