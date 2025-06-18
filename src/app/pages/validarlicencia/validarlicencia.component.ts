import { Component, inject } from '@angular/core';
import { LicenseService } from '../../services/license.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-validarlicencia',
  imports: [CommonModule, FormsModule],
  templateUrl: './validarlicencia.component.html',
  styleUrl: './validarlicencia.component.css'
})
export class ValidarlicenciaComponent {
  licenseKey: string = '';
  isValid: boolean | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private licenseService: LicenseService) {}

  validateLicense() {
    this.isLoading = true;
    this.isValid = null;
    this.errorMessage = null;

    this.licenseService.validateLicense(this.licenseKey).subscribe({
      next: (response) => {
        this.isValid = response.isValid;
        this.isLoading = false;
        if(this.isValid){
          this.saveLicenseKey(this.licenseKey)
        }
      },
      error: (error) => {
        this.errorMessage = 'Error validating license.';
        this.isLoading = false;
        console.error('Error validating license:', error);
        this.isValid = false;
        if (error.error && error.error.error) {
          this.errorMessage = error.error.error;
        }
      },
    });
  }
  saveLicenseKey(licenseKey:string){
    localStorage.setItem('licenseKey', licenseKey);
  }
}
