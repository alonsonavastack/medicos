import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, signal, OnInit, forwardRef } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

interface ToothTreatment {
  type: string;
  status: 'existente' | 'requerida';
}

interface ToothData {
  id: string;
  faces?: { [face: string]: ToothTreatment };
  note?: string;
  selectedTreatmentType?: string;
  selectedTreatmentStatus?: 'existente' | 'requerida';
  treatment?: {
    type: string;
    status: 'existente' | 'requerida';
    symbol?: string;
    color?: string;
  };
}

interface TreatmentOption {
  code: string;
  name: string;
  symbol: string;
  color: string;
}

@Component({
  selector: 'app-odontograma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './odontograma.component.html',
  styles: [`:host { display: block; }`],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OdontogramaComponent),
      multi: true
    }
  ]
})
export class OdontogramaComponent implements OnInit, ControlValueAccessor {
  @Input() value: any;
  private onChange: any = () => {};
  private onTouched: any = () => {};

  writeValue(value: any): void {
    if (!value) {
      this.toothData = this.allToothIds.flat().map(id => ({ id }));
      return;
    }

    const dientes = Array.isArray(value) ? value : [];
    console.log('Dientes recibidos:', dientes);

    this.toothData = this.allToothIds.flat().map(id => {
      const diente = dientes.find(d => d.numero_diente.toString() === id);
      if (!diente) return { id };
      console.log('Mapeando diente:', id, diente);

      // Encontrar el tratamiento correspondiente para obtener el símbolo y color
      const treatmentOption = this.treatmentOptions.find(t => t.code === diente.estado);

      return {
        id,
        treatment: diente.estado ? {
          type: diente.estado,
          status: diente.tratamiento || 'existente',
          symbol: treatmentOption?.symbol,
          color: treatmentOption?.color
        } : undefined,
        faces: diente.caras?.reduce((acc: any, cara: any) => {
          const caraTreatmentOption = this.treatmentOptions.find(t => t.code === cara.estado);
          acc[cara.cara] = {
            type: cara.estado,
            status: 'existente',
            symbol: caraTreatmentOption?.symbol,
            color: caraTreatmentOption?.color
          };
          return acc;
        }, {}),
        note: diente.notas
      };
    });

    console.log('Datos cargados en el odontograma:', this.toothData);

    console.log('Datos cargados en el odontograma:', this.toothData);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implementar si es necesario
  }
  @Output() toothStateChange = new EventEmitter<ToothData[]>();
 allToothIds = [
    // Permanentes superiores (8 por cuadrante)
    ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'],
    // Temporales
    ['55','54','53','52','51','61','62','63','64','65','85','84','83','82','81','71','72','73','74','75'],
    // No usado
    [],
    // Permanentes inferiores (8 por cuadrante)
    ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38']
  ];

  treatmentOptions: TreatmentOption[] = [
    {code: 'TC', name: 'Tratamiento de Conducto', symbol: 'TC', color: 'text-gray-800'},
    {code: 'C', name: 'Caries', symbol: '•', color: 'text-blue-600'},
    {code: 'E', name: 'Extracción', symbol: 'X', color: 'text-blue-600'},
    {code: 'A', name: 'Diente Ausente', symbol: 'X', color: 'text-red-600'},
    {code: 'O', name: 'Obturación', symbol: '•', color: 'text-red-600'},
    {code: 'OM', name: 'Obturación en mal estado', symbol: '•', color: 'text-blue-600 bg-red-600 rounded-full'},
    {code: 'CR', name: 'Corona', symbol: 'O', color: 'text-green-900'},
    {code: 'CM', name: 'Corona en mal estado', symbol: 'O', color: 'text-blue-600'},
    {code: 'I', name: 'Incrustación', symbol: 'I', color: 'text-green-800'},
    {code: 'P', name: 'Puente', symbol: '⊓', color: 'text-green-800'},
    {code: 'PR', name: 'Prótesis Removible', symbol: '□', color: 'text-green-800'},
    {code: 'OR', name: 'Ortodoncia', symbol: '〰', color: 'text-green-800'},
    {code: 'IM', name: 'Implante', symbol: 'IM', color: 'text-green-800'}
  ];

  toothData: ToothData[] = [];

  ngOnInit(): void {
    if (this.value) {
      this.writeValue(this.value);
    } else {
      this.toothData = this.allToothIds.flat().map(id => ({ id }));
    }
  }
  selectedToothId: string | null = null;

  showTreatmentModal = signal(false);

  selectedTreatmentType = 'Caries';
  selectedTreatmentStatus: 'existente' | 'requerida' = 'existente';

  resetTreatmentSelection() {
    this.selectedTreatmentType = 'Caries';
    this.selectedTreatmentStatus = 'existente';
  }

  toothFaces = ['mesial', 'distal', 'lingual', 'vestibular', 'incisal'];
  selectedFaces: { [face: string]: boolean } = {};

  getToothById(id: string): ToothData | undefined {
    return this.toothData.find(tooth => tooth.id === id);
  }

  selectTooth(toothId: string) {
    this.selectedToothId = toothId;
    const tooth = this.getToothById(toothId);
    if (tooth && tooth.treatment) {
      this.selectedTreatmentType = tooth.treatment.type;
      this.selectedTreatmentStatus = tooth.treatment.status;
    } else {
      this.resetTreatmentSelection();
    }
    this.loadFacesForTooth(toothId);
    this.showTreatmentModal.set(true);
  }

  applyTreatment(toothId: string, treatmentCode: string, status: 'existente' | 'requerida') {
    const tooth = this.getToothById(toothId);
    const treatment = this.treatmentOptions.find(t => t.code === treatmentCode);
    
    if (tooth && treatment) {
      // Guardar el tratamiento principal del diente
      tooth.treatment = {
        type: treatmentCode,
        status: status,
        symbol: treatment.symbol,
        color: treatment.color
      };
      
      // Actualizar las caras seleccionadas
      tooth.faces = tooth.faces || {};
      
      // Si hay caras seleccionadas, actualizarlas
      if (Object.keys(this.selectedFaces).length > 0) {
        Object.entries(this.selectedFaces).forEach(([face, isSelected]) => {
          if (isSelected) {
            tooth.faces![face] = {
              type: treatmentCode,
              status: status
            };
          }
        });
      }

      // Notificar cambios al formulario padre
      const odontogramaData = this.toothData
        .filter(tooth => tooth.treatment || tooth.faces)
        .map(tooth => ({
          numero: parseInt(tooth.id),
          estado: tooth.treatment?.type || '',
          tratamiento: tooth.treatment?.status || '',
          notas: tooth.note || '',
          caras: tooth.faces ? Object.entries(tooth.faces).map(([cara, tratamiento]) => ({
            cara,
            estado: tratamiento.type
          })) : []
        }));
      console.log('Emitiendo datos del odontograma:', odontogramaData);
      this.onChange(odontogramaData);
      this.onTouched();

      this.showTreatmentModal.set(false);
      this.selectedToothId = null;
      this.resetTreatmentSelection();
      this.selectedFaces = {};
    }
  }

  loadFacesForTooth(toothId: string) {
    const tooth = this.getToothById(toothId);
    if (tooth) {
      if (!tooth.selectedTreatmentStatus) {
        tooth.selectedTreatmentStatus = 'existente';
      }
      if (!tooth.faces) {
        tooth.faces = {};
      }
    }
    
    // Inicializar las caras seleccionadas
    this.selectedFaces = this.toothFaces.reduce((acc, face) => {
      acc[face] = !!tooth?.faces?.[face];
      return acc;
    }, {} as { [face: string]: boolean });
  }

  cancelTreatment() {
    this.showTreatmentModal.set(false);
    this.selectedToothId = null;
    this.resetTreatmentSelection();
    this.selectedFaces = {};
  }

  selectTreatment(treatmentCode: string) {
    if (this.selectedToothId) {
      const tooth = this.getToothById(this.selectedToothId);
      if (tooth) {
        tooth.selectedTreatmentType = treatmentCode;
      }
    }
  }



  getTreatmentColor(treatment: string): string {
    switch(treatment) {
      case 'TC': return '#8B4513'; // Café
      case 'Carles': return '#A52A2A'; // Marrón
      case 'Extraccion': return '#000000'; // Negro
      case 'Ausente': return '#808080'; // Gris
      case 'Obturacion': return '#0000FF'; // Azul
      case 'ObturacionMalEstado': return '#FFA500'; // Naranja
      case 'Corona': return '#FFD700'; // Oro
      case 'CoronaMalEstado': return '#FF8C00'; // Naranja oscuro
      case 'Incrustacion': return '#C0C0C0'; // Plata
      case 'Puente': return '#008000'; // Verde
      case 'ProtesisRemovible': return '#FFC0CB'; // Rosa
      case 'Ortodoncia': return '#00FFFF'; // Cian
      case 'Implante': return '#008080'; // Verde azulado
      default: return '#FF0000'; // Rojo (predeterminado)
    }
  }

  getOdontogramaData(): any {
    if (!this.toothData) return null;

    return this.toothData
      .filter((tooth: ToothData) => tooth.treatment || (tooth.faces && Object.keys(tooth.faces).length > 0))
      .map((tooth: ToothData) => {
        // Inicializar el array de caras
        const caras = [];
        
        // Si hay caras afectadas, procesarlas
        if (tooth.faces) {
          for (const [cara, tratamiento] of Object.entries(tooth.faces)) {
            caras.push({
              cara,
              estado: tratamiento.type,
              tratamiento: tratamiento.status
            });
          }
        }

        return {
          numero_diente: parseInt(tooth.id),
          estado: tooth.treatment?.type || '',
          tratamiento: tooth.treatment?.status || 'existente',
          notas: tooth.note || '',
          caras: caras
        };
           
      });
  }

  guardarOdontograma(): void {
    const data = this.getOdontogramaData();
    if (!data) return;
    this.toothStateChange.emit(data);
    this.onChange(data);
    this.onTouched();
    console.log('Datos del odontograma:', JSON.stringify(data, null, 2));
  }
}

  
