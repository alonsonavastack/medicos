import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { PacienteService } from '../../../services/paciente.service';
import { FormsModule, NgForm } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { OdontogramaComponent } from '../../odontograma/odontograma.component';

interface Item {
  idpaciente: number;
  nompaciente: string;
  edadpaciente: string;
  telpaciente: string;
  dirpaciente: string;
  correopaciente: string;
  generopaciente: string;
  ahfpaciente: string;
  apnppaciente: string;
  apppaciente: string;
  agopaciente: string;
  cardiacopaciente: string;
  respiratoriopaciente: string;
  digestivopaciente: string;
  pielytegumentospaciente: string;
  hemotipopaciente: string;
  terapeuticapaciente: string;
  pronosticopaciente: string;
  odontograma?: any;
}

@Component({
  selector: 'app-lista-paciente',
  imports: [CommonModule, FormsModule, OdontogramaComponent],
  templateUrl: './lista-paciente.component.html',
  styleUrl: './lista-paciente.component.css',
})
export class ListaPacienteComponent {
  pacientesService = inject(PacienteService);
  toast = inject(HotToastService);

  private _allPacientes = this.pacientesService.pacientes;
  pacientes = signal<Item[]>([]);
  sortBy = signal<keyof Item>('nompaciente');
  sortOrder = signal<'asc' | 'desc'>('asc');

  showModal = signal(false);
  showVerModal = signal(false);
  showConfirmationModal = signal(false);
  showDelete = signal(false);
  idPacienteToDelete = signal<number>(0)
  idPacienteEliminar: any;
  idPacienteDiagnostico: any;
  selectedPaciente = signal<Item>({    
    idpaciente: 0,
    nompaciente: '',
    edadpaciente: '',
    telpaciente: '',
    dirpaciente: '',
    correopaciente: '',
    generopaciente: '',
    ahfpaciente: '',
    apnppaciente: '',
    apppaciente: '',
    agopaciente: '',
    cardiacopaciente: '',
    respiratoriopaciente: '',
    digestivopaciente: '',
    pielytegumentospaciente: '',
    hemotipopaciente: '',
    terapeuticapaciente: '',
    pronosticopaciente: '',
    odontograma: null
  });

  isLoading = this.pacientesService.isLoading
  searchText: string = '';

  constructor() {
      effect(() => {
        this.pacientes.set(this._allPacientes());
      });
    }

  onEditPaciente(item: Item) {
    this.showModal.set(true);
    // Asegurarse de que el odontograma esté inicializado con la estructura correcta
    const paciente = {...item};
    if (!paciente.odontograma) {
      paciente.odontograma = {
        dientes: []
      };
    } else {
      // Asegurar que los dientes tengan la estructura correcta
      paciente.odontograma.dientes = paciente.odontograma.dientes.map((diente: any) => ({
        numero_diente: diente.numero_diente,
        estado: diente.estado || '',
        tratamiento: diente.tratamiento || 'existente',
        notas: diente.notas || '',
        caras: diente.caras || []
      }));
    }
 
    this.selectedPaciente.set(paciente);
  }

  onOdontogramaChange(event: any) {
    
    if (Array.isArray(event)) {
      const pacienteData = {...this.selectedPaciente()};
      
      // Transformar los datos al formato requerido
      console.log('Datos originales del odontograma:', event);
      pacienteData.odontograma = {
        dientes: event.map((tooth: any) => {
          const diente = {
            numero_diente: tooth.numero_diente,
            estado: tooth.estado || '',
            tratamiento: tooth.tratamiento || 'existente',
            notas: tooth.notas || '',
            caras: Array.isArray(tooth.caras) ? tooth.caras.map((cara: any) => ({
              cara: cara.cara || '',
              estado: cara.estado || ''
            })) : []
          };
          console.log('Diente transformado:', diente);
          return diente;
        })
      };
      console.log('Odontograma completo transformado:', pacienteData.odontograma);
      this.selectedPaciente.set(pacienteData);
    } else {
      console.error('El evento del odontograma no es un array:', event);
    }
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

  getOdontogramaData() {
    const formData = this.selectedPaciente();
    return formData.odontograma || [];
  }

  confirmEditPaciente() {
    this.showConfirmationModal.set(false);
    const formData = this.selectedPaciente();
    
    const pacienteData = {
      ...formData,
      odontograma: {
        dientes: formData.odontograma?.dientes.map((diente: any) => ({
          numero_diente: diente.numero_diente,
          estado: diente.estado || '',
          tratamiento: diente.tratamiento || 'existente',
          notas: diente.notas || '',
          caras: Array.isArray(diente.caras) ? diente.caras.map((cara: any) => ({
            cara: cara.cara || '',
            estado: cara.estado || ''
          })) : []
        })) || []
      }
    };
    
    console.log('Datos del paciente a enviar:', pacienteData);

    this.pacientesService.editarPaciente(pacienteData)
      .subscribe({
        next: (response: any) => {
          if (response.body?.resultado === 'OK') {
            this.toast.success('Paciente actualizado con éxito');
            this.pacientesService.refetchPacientes();
            this.showModal.set(false);
          } else {
            this.toast.error(response.body?.mensaje || 'Error al actualizar el paciente');
            console.error('Respuesta inesperada:', response);
          }
        },
        error: (error) => {
          this.toast.error('Error al actualizar el paciente');
          console.error('Error completo:', error);
          if (error.status === 0) {
            console.error('Error de conexión - Verifique que el servidor esté funcionando');
          }
        }
      });
  }

  cancelEditPaciente() {
    this.showConfirmationModal.set(false);
   }

   showDeleteModal(paciente: any) {
    this.idPacienteEliminar = paciente.id;
    if (!paciente || !this.idPacienteEliminar) {
      this.toast.error('Paciente no válido');
      return;
    }
    this.showDelete.set(true);
    this.selectedPaciente.set(this.idPacienteEliminar);
  }

  confirmDeletePaciente() {
    this.showDelete.set(false);
    const formData = this.selectedPaciente();
    console.log('Datos del paciente a eliminar:', formData);
    if (!formData) {
      this.toast.error('ID de paciente no válido');
      return;
    }

    this.pacientesService.eliminarPaciente(formData)
      .subscribe({
        next: (response: any) => {
          if (response.body?.resultado === 'OK') {
            this.toast.success('Paciente eliminado con éxito', {
              dismissible: true,
            });
            this.pacientesService.refetchPacientes();
          } else {
            this.toast.error(response.body?.mensaje || 'Error al eliminar el paciente');
            console.error('Respuesta inesperada:', response);
          }
        },
        error: (error) => {
          this.toast.error('Error al eliminar el paciente');
          console.error('Error completo:', error);
          if (error.status === 0) {
            console.error('Error de conexión - Verifique que el servidor esté funcionando');
          }
        }
      });
  }

  onDeletePaciente(idpaciente: number) {
    this.showDelete.set(true);

   }

  cancelDeletePaciente() {
    this.showDelete.set(false);
  }

  filteredPacientesList() {
    if (!this.searchText) {
      return this.pacientes();
    }
    const search = this.searchText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

      return this.pacientes().filter((item) => {

        const nompaciente = item.nompaciente
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

          return nompaciente.includes(search);
      });
  }

  resetPacientes(){
    this.searchText = '';
  }

  seleccionarDiagnostico(idpaciente: any) {
    this.idPacienteDiagnostico = idpaciente.id;
    this.pacientesService.seleccionarDiagnostico(this.idPacienteDiagnostico)
  }
}
