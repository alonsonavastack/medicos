import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-header',
  imports: [NgIf],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('500ms ease-out', style({ opacity: 1, height: '*' })),
      ]),
      transition(':leave', [
        // style({ opacity: 1, height: '*' }),
        animate('500ms ease-out', style({ opacity: 0, height: 0 })),
      ]),
    ]),
  ],
})
export class HeaderComponent {

  collapsed = signal(false);
  isDarkMode = signal(false); // Now a signal

  ngOnInit() {
    const storedDarkMode = localStorage.getItem('theme');
    this.isDarkMode.set(storedDarkMode === 'dark'); // Use set()
    this.applyDarkModeClass(this.isDarkMode()); // Access value with ()
  }

  toggleDarkMode() {
    this.isDarkMode.update(current => !current); // Update the signal's value
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
    this.applyDarkModeClass(this.isDarkMode());
  }

  private applyDarkModeClass(enable: boolean) {
    const body = document.querySelector('body');
    if (enable) {
      body?.classList.add('dark-mode');
    } else {
      body?.classList.remove('dark-mode');
    }
  }
}
