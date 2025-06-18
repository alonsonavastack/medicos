import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
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
  private editarHistorialUrl = `${this.base_url}EditarExpediente.php`;
  private eliminarHistorialUrl = `${this.base_url}EliminarExpediente.php`;
  private creacionRecetaUrl = `${this.base_url}TCPDF-main/rec.php`;
  private creacionDiagnosticoUrl = `${this.base_url}TCPDF-main/diag.php`;
  private loginUrl = `${this.base_url}login.php`;
date = new Date();

  public pacientesList = signal<any>([]); // Initial empty array

  altaPaciente(dataForm: any) {
    console.log(dataForm)
    return this.http.post(this.altaPacienteUrl, dataForm);
  }

  altaHistorial(dataForm: FormData) { // Changed parameter type
    // The console.log might not display FormData contents well, this is normal.
    console.log('Sending FormData to altaHistorial:', dataForm);
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
            correopaciente: item.correopaciente,
            ahfpaciente: item.ahfpaciente,
            apnppaciente: item.apnppaciente,
            apppaciente: item.apppaciente,
            agopaciente: item.agopaciente,
            cardiacopaciente: item.cardiacopaciente,
            respiratoriopaciente: item.respiratoriopaciente,
            digestivopaciente: item.digestivopaciente,
            pielytegumentospaciente: item.pielytegumentospaciente,
            hemotipopaciente: item.hemotipopaciente,
            terapeuticapaciente: item.terapeuticapaciente,
            pronosticopaciente: item.pronosticopaciente,
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

  updatePacientes() {
    this.pacientesResource.reload()
  }

  public historialResource = httpResource<any>
  (this.obtenerHistorialUrl);
  historial = computed(() =>
    this.historialResource.value() ?? ([] as any[]));

  isLoadingHistorial = this.historialResource.isLoading;
  refetchHistorial() {
    this.historialResource.reload();
  }

  updateHistorial() {
    this.historialResource.reload()
  }

  editarHistorial(data: any) {
    const dataToSend = { ...data }; // Create a copy
    dataToSend.fechahistorial = this.date.toLocaleDateString();
    delete dataToSend.nompaciente; // Remove nompaciente from the copy
    console.log("Data to send", dataToSend)

    return this.http.post(this.editarHistorialUrl, JSON.stringify(dataToSend));
  }

  eliminarHistorial(idhistorial: any) {
    return this.http.get(
      `${this.eliminarHistorialUrl}?idhistorial=${idhistorial}`
    );
  }

  seleccionarReceta(idhistorial: any) {
    window.open(`${this.creacionRecetaUrl}?idhistorial=${idhistorial}`, '_blank');
  }
  seleccionarDiagnostico(idpaciente: any) {
    window.open(`${this.creacionDiagnosticoUrl}?idpaciente=${idpaciente}`, '_blank');
  }

  login(data: any) {
    return this.http.post(this.loginUrl, JSON.stringify(data));
  }
}
