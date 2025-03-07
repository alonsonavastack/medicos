import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { delay, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  http = inject(HttpClient);
  base_url = environment.url;

  private altaPacienteUrl = `${this.base_url}AltaPaciente.php`;
  private obtenerPacientesUrl = `${this.base_url}ObtenerPacientes.php`;
  private editarPacienteUrl = `${this.base_url}EditarPaciente.php`;
  private eliminarPacienteUrl = `${this.base_url}EliminarPaciente.php`;
  private altaHistorialUrl = `${this.base_url}NuevoHistorial.php`;
  private obtenerHistorialUrl = `${this.base_url}ObtenerHistoriales.php`;

  altaPaciente(dataForm: any) {
    return this.http.post(this.altaPacienteUrl, dataForm);
  }

  altaHistorial(dataForm: any) {
    return this.http.post(this.altaHistorialUrl, dataForm);
  }

  pacientesResource = rxResource({
    loader: () =>
      this.http.get<any>(this.obtenerPacientesUrl).pipe(
        map((data: any) => {
          return data.map((item: any) => ({
            idpaciente: item.idpaciente,
            nompaciente: item.nompaciente,
            edadpaciente: item.edadpaciente,
            telpaciente: item.telpaciente,
            dirpaciente: item.dirpaciente,
          }));
        }),
        delay(1500)
      ),
  });

  pacientes = computed(() => this.pacientesResource.value() ?? ([] as any[]));

  isLoading = this.pacientesResource.isLoading;

  editarPaciente(data: any) {
    return this.http.post(this.editarPacienteUrl, JSON.stringify(data));
  }

  eliminarPaciente(idpaciente: number) {
    return this.http.get(
      `${this.eliminarPacienteUrl}?idpaciente=${idpaciente}`
    );
  }

  refetchPacientes() {
    this.pacientesResource.reload();
  }

  //historial
  // historialResource = rxResource({
  //   loader: () =>
  //     this.http.get<any>(this.obtenerHistorialUrl).pipe(
  //       map((data: any) => {
  //         return data.map((item: any) => ({
  //           idhistorial: item.idhistorial,
  //           pesohistorial: item.pesohistorial,
  //           tallahistorial: item.tallahistorial,
  //           fchistorial: item.fchistorial,
  //           citahistorial: item.citahistorial,
  //           idpaciente: item.idpaciente,
  //           nompaciente: item.nompaciente,
  //           fechahistorial: item.fechahistorial,
  //           diagnostico: item.diagnostico,
  //         }));
  //       }),
  //       delay(1500)
  //     ),
  // });

  private historialResource = httpResource<any>(this.obtenerHistorialUrl)
  historial = computed(() => this.historialResource.value() ?? ([] as any[]));

  isLoadingHistorial = this.historialResource.isLoading;
  refetchHistorial() {
    this.historialResource.reload();
  }

  editarHistorial(data: any) {
    return this.http.post(this.editarPacienteUrl, JSON.stringify(data));
  }

  eliminarHistorial(idpaciente: number) {
    return this.http.get(
      `${this.eliminarPacienteUrl}?idpaciente=${idpaciente}`
    );
  }
}
