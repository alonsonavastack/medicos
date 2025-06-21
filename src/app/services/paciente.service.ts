import { rxResource } from '@angular/core/rxjs-interop';
import { HttpClient, HttpHeaders, httpResource, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { catchError, delay, map, Observable, throwError } from 'rxjs';

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
  public isLoading = signal<boolean>(false);

  editarPaciente(paciente: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Enviando datos actualizados:', paciente);
    return this.http.post(this.editarPacienteUrl, paciente, { 
      headers, 
      withCredentials: true,
      observe: 'response'
    }).pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        console.error('URL:', this.editarPacienteUrl);
        console.error('Headers:', headers);
        return throwError(() => error);
      })
    );
  }

  altaPaciente(dataForm: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    console.log('Enviando datos al servidor:', dataForm);
    return this.http.post(this.altaPacienteUrl, dataForm, { headers });
  }

 altaHistorial(dataForm: FormData) {
    const headers = new HttpHeaders({
        'Accept': 'application/json'
    });
    
    return this.http.post(this.altaHistorialUrl, dataForm, { 
        headers: headers,
        reportProgress: true,
        observe: 'response'
    }).pipe(
        catchError(error => {
            console.error('Error en la solicitud:', error);
            return throwError(() => error);
        })
    );
}

  pacientesResource = rxResource({
    loader: () =>
      this.http.get<any>(this.obtenerPacientesUrl).pipe(
        map((data: any) => {
          return data.map((item: any) => ({
            id: item.id,
            nompaciente: item.nompaciente,
            edadpaciente: item.edadpaciente,
            telpaciente: item.telpaciente,
            dirpaciente: item.dirpaciente,
            correopaciente: item.correopaciente,
            generopaciente: item.generopaciente,
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
            odontograma: item.odontograma ? {
              dientes: item.odontograma.dientes.map((diente: any) => ({
                numero_diente: diente.numero_diente,
                estado: diente.estado || '',
                tratamiento: diente.tratamiento || 'existente',
                notas: diente.notas || '',
                caras: diente.caras || []
              }))
            } : { dientes: [] }
          }));
        }),
        delay(1500)
      ),
  });

  pacientes = computed(() => this.pacientesResource.value() ?? ([] as any[]));

  // isLoading = this.pacientesResource.isLoading;

  // editarPaciente(data: any) {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/json'
  //   });
    
  //   console.log('Enviando datos actualizados:', data);
  //   return this.http.post(this.editarPacienteUrl, data, { 
  //     headers,
  //     withCredentials: true
  //   }).pipe(
  //     catchError(error => {
  //       console.error('Error en la solicitud:', error);
  //       return throwError(() => error);
  //     })
  //   );
  // }

  eliminarPaciente(id: any) {
   
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post(this.eliminarPacienteUrl, { id }, { 
      headers,
      withCredentials: true,
      observe: 'response'
    }).pipe(
      catchError(error => {
        console.error('Error en la solicitud:', error);
        console.error('URL:', this.eliminarPacienteUrl);
        console.error('Headers:', headers);
        return throwError(() => error);
      })
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

editarHistorial(data: any, recipeImageFile?: File | null): Observable<HttpResponse<any>> { // Expect HttpResponse
    const formData = new FormData();

    // Append all other form data
    for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] !== null && data[key] !== undefined) {
            // Ensure idhistorial is present for the PHP script
            if (key === 'idhistorial' && !data[key]) {
                console.error('idhistorial is missing in editarHistorial data');
                // Handle this error appropriately, maybe return an error observable
            }
            formData.append(key, data[key]);
        }
    }

    // Append the image file if provided
    if (recipeImageFile) {
        formData.append('recipeImage', recipeImageFile, recipeImageFile.name);
    }

    // Remove nompaciente if it's not needed by the backend for editing historial
    // (Your current PHP script for EditarExpediente doesn't use nompaciente directly in SET)
    // formData.delete('nompaciente'); // If you were sending it and PHP doesn't need it

    console.log("FormData to send for edit:", formData);
    // Log FormData entries for debugging
    // formData.forEach((value, key) => {
    //   console.log(key, value);
    // });

    const headers = new HttpHeaders({
        'Accept': 'application/json'
        // 'Content-Type' is NOT set here, Angular HttpClient sets it automatically for FormData
    });

    return this.http.post<any>(this.editarHistorialUrl, formData, {
        headers: headers,
        reportProgress: true, // Optional
        observe: 'response'    // To get the full HttpResponse
    }).pipe(
        catchError(error => {
            console.error('Error en la solicitud de edición de historial:', error);
            return throwError(() => error);
        })
    );
}

  eliminarHistorial(idhistorial: any) {
    return this.http.get(
      `${this.eliminarHistorialUrl}?idhistorial=${idhistorial}`
    );
  }

  seleccionarReceta(idhistorial: any) {
    window.open(`${this.creacionRecetaUrl}?idhistorial=${idhistorial}`, '_blank');
  }
  seleccionarDiagnostico(id: any) {
    window.open(`${this.creacionDiagnosticoUrl}?id=${id}`, '_blank');
  }

  login(data: any) {
    return this.http.post(this.loginUrl, JSON.stringify(data));
  }
}
