import { Component, computed, inject, signal } from '@angular/core';
import { PacienteService } from '../../../services/paciente.service';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';

interface Item {
  idhistorial: string,
  pesohistorial: string,
  tallahistorial: string,
  fchistorial: string,
  citahistorial: string,
  idpaciente: string,
  nompaciente: string
  fechahistorial: string,
  diagnostico: string,
}

@Component({
  selector: 'app-lista-historial',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lista-historial.component.html',
  styleUrl: './lista-historial.component.css'
})
export class ListaHistorialComponent {
pacientesService = inject(PacienteService);
  toast = inject(HotToastService);

  historial = this.pacientesService.historial;
  pacientes = this.pacientesService.pacientes;

  sortBy = signal<keyof Item>('nompaciente');
  sortOrder = signal<'asc' | 'desc'>('asc');

  showModal = signal(false);
  showVerModal = signal(false);
  showConfirmationModal = signal(false);
  showDelete = signal(false);
  idHistorialToDelete = signal<number>(0)

  selectedHistorial = signal<Item>({
    idhistorial: '',
    pesohistorial: '',
    tallahistorial: '',
    fchistorial: '',
    citahistorial: '',
    idpaciente: '',
    nompaciente: '',
    fechahistorial: '',
    diagnostico: '',
  });

  constructor() {
    console.log(this.historial());
  }

  isLoading = this.pacientesService.isLoadingHistorial

  sortedHistorial = computed(() => {
    const currentSortBy = this.sortBy();
    const currentSortOrder = this.sortOrder();

    return [...this.historial()].sort((a, b) => {
      const valueA = a[currentSortBy];
      const valueB = b[currentSortBy];

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return currentSortOrder === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === 'number' && typeof valueB === 'number') {
        return currentSortOrder === 'asc' ? valueA - valueB : valueB - valueA;
      } else {
        return 0;
      }
    });
  });

  setSortBy(column: keyof Item) {
    if (this.sortBy() === column) {
      this.sortOrder.update((order) => (order === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
  }

  onEditHistorial(item: Item) {
    this.showModal.set(true);
    this.selectedHistorial.set(item);
  }

  onVerHistorial(item: Item) {
    this.showVerModal.set(true);
    this.selectedHistorial.set(item);
  }

  onCloseModal() {
    this.showModal.set(false);
  }

  onCloseVerModal() {
    this.showVerModal.set(false);
  }

  onSubmit(editForm: NgForm) {
    if (editForm.invalid) {
      this.toast.warning('Por favor, complete todos los campos', {dismissible: true});
      editForm.form.markAllAsTouched();
      return;
    }
    console.log(editForm.value)
    return
    this.showConfirmationModal.set(true);
  }

  confirmEditHistorial() {
    this.showConfirmationModal.set(false);
    this.pacientesService.editarHistorial(this.selectedHistorial()).subscribe({
      next: (response: any) => {
        if (response['resultado'] == 'OK') {
          this.toast.success('Historial actualizado con éxito', {
            dismissible: true,
          });
          this.showModal.set(false);
          this.pacientesService.refetchHistorial
        }
      },
      error: (error) => {
        this.toast.error('No se pudo actualizar el paciente', {
          dismissible: true,
        });
        console.log(error);
      },
    });
    this.showModal.set(false);
  }

  cancelEditHistorial() {
    this.showConfirmationModal.set(false);
   }

   showDeleteModal(idpaciente: number) {
    this.showDelete.set(true);
    this.idHistorialToDelete.set(idpaciente)
  }

  confirmDeleteHistorial() {
    this.showDelete.set(false);
    this.pacientesService.eliminarPaciente( this.idHistorialToDelete() )
    .subscribe({
      next: (response: any) => {
        this.toast.success('Historial eliminado con éxito', {
          dismissible: true,
        });
        this.pacientesService.refetchHistorial();
      },
      error: (error) => {
        this.toast.error('No se pudo eliminar el paciente', {
          dismissible: true,
        });
        console.log(error);
      },
      complete: () => {
        console.log('Paciente eliminado');
      }
    })
  }

  onDeleteHistorial(idhistorial: number) {
    this.showDelete.set(true);

   }

  cancelDeleteHistorial() {
    this.showDelete.set(false);
  }
}
