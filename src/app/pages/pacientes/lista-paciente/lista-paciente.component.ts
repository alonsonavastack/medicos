import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PacienteService } from '../../../services/paciente.service';
import { FormsModule, NgForm } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';

interface Item {
  idpaciente: any;
  nompaciente: string;
  edadpaciente: string;
  telpaciente: string;
  dirpaciente: string;
}

@Component({
  selector: 'app-lista-paciente',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-paciente.component.html',
  styleUrl: './lista-paciente.component.css',
})
export class ListaPacienteComponent {
  pacientesService = inject(PacienteService);
  toast = inject(HotToastService);

  pacientes = this.pacientesService.pacientes;

  sortBy = signal<keyof Item>('nompaciente');
  sortOrder = signal<'asc' | 'desc'>('asc');

  showModal = signal(false);
  showVerModal = signal(false);
  showConfirmationModal = signal(false);
  showDelete = signal(false);
  idPacienteToDelete = signal<number>(0)

  selectedPaciente = signal<Item>({
    idpaciente: '',
    nompaciente: '',
    edadpaciente: '',
    telpaciente: '',
    dirpaciente: '',
  });

  isLoading = this.pacientesService.isLoading

  sortedPacientes = computed(() => {
    const currentSortBy = this.sortBy();
    const currentSortOrder = this.sortOrder();

    return [...this.pacientes()].sort((a, b) => {
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

  onEditPaciente(item: Item) {
    this.showModal.set(true);
    this.selectedPaciente.set(item);
  }

  onVerPaciente(item: Item) {
    this.showVerModal.set(true);
    this.selectedPaciente.set(item);
  }

  onCloseModal() {
    this.showModal.set(false);
  }

  onCloseVerModal() {
    this.showVerModal.set(false);
  }

  onSubmit(editForm: NgForm) {
    if (editForm.invalid) {
      this.toast.warning('Por favor, complete todos los campos', {
        dismissible: true,
      })
      editForm.form.markAllAsTouched();
      return;
    }
    this.showConfirmationModal.set(true);
  }

  confirmEditPaciente() {
    this.showConfirmationModal.set(false);
    this.pacientesService.editarPaciente(this.selectedPaciente()).subscribe({
      next: (response: any) => {
        if (response['resultado'] == 'OK') {
          this.toast.success('Paciente actualizado con éxito', {
            dismissible: true,
          });
          this.showModal.set(false);
          this.pacientesService.refetchPacientes
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

  cancelEditPaciente() {
    this.showConfirmationModal.set(false);
   }

   showDeleteModal(idpaciente: number) {
    this.showDelete.set(true);
    this.idPacienteToDelete.set(idpaciente)
  }

  confirmDeletePaciente() {
    this.showDelete.set(false);
    this.pacientesService.eliminarPaciente( this.idPacienteToDelete() )
    .subscribe({
      next: (response: any) => {
        this.toast.success('Paciente eliminado con éxito', {
          dismissible: true,
        });
        this.pacientesService.refetchPacientes();
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

  onDeletePaciente(idpaciente: number) {
    this.showDelete.set(true);

   }

  cancelDeletePaciente() {
    this.showDelete.set(false);
  }
}
