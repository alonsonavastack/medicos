import { Component } from '@angular/core';
import { LicenseService } from '../../services/license.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-licencia',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './licencia.component.html',
  styleUrl: './licencia.component.css'
})
export class LicenciaComponent {
  licenseKey: string | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(private licenseService: LicenseService) {}

  generateLicense() {
    this.isLoading = true;
    this.licenseKey = null;
    this.errorMessage = null;

    this.licenseService.generateLicense().subscribe({
      next: (response) => {
        this.licenseKey = response.licenseKey; // Assuming your API returns { licenseKey: '...' }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error generating license.';
        this.isLoading = false;
        console.error('Error generating license:', error);
      },
    });
  }
  copyToClipboard() {
    if (this.licenseKey) {
      navigator.clipboard.writeText(this.licenseKey)
      .then(() => {
        // Success! Optionally, show a success message
        console.log('License copied to clipboard');
      })
      .catch(err => {
        // Handle error, show error message
        console.error('Failed to copy license to clipboard', err);
      });
    }
  }
}
