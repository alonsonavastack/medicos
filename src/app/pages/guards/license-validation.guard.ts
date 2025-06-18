import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { LicenseService } from '../../services/license.service';
import { Observable, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LicenseValidationGuard implements CanActivate {
  private licenseService = inject(LicenseService);
  private router = inject(Router);

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Check if a license key exists (e.g., in local storage, or get it from somewhere else)
    const licenseKey = localStorage.getItem('licenseKey'); // Modify this line to get your license key

    if (licenseKey) {
      return this.licenseService.validateLicense(licenseKey).pipe(
        map((response) => {
          if (response.isValid) {
            // License is valid, allow navigation
            return true;
          } else {
            // License is invalid, redirect to /validar-licencia
            return this.router.createUrlTree(['/validar-licencia']);
          }
        }),
        catchError((error) => {
          // Error during validation, redirect to /validar-licencia
          console.error('Error validating license:', error);
          return of(this.router.createUrlTree(['/validar-licencia']));
        })
      );
    } else {
      // No license key found, redirect to /validar-licencia
      return of(this.router.createUrlTree(['/validar-licencia']));
    }
  }
}
