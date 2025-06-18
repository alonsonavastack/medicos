import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LicenseService {
  http = inject(HttpClient);
   base_url = environment.url;

   private generarLicencia = `${this.base_url}generarLicencia.php`;
   private validarLicencia = `${this.base_url}validarLicencia.php`;

  generateLicense(): Observable<any> {
    return this.http.post(this.generarLicencia, {});
  }

  validateLicense(licenseKey: string): Observable<any> {
    return this.http.post(this.validarLicencia, { licenseKey });
  }
}
