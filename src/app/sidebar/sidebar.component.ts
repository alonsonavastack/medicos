import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { animate, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  animations: [
    trigger('expandContractMenu', [
      transition(':enter', [
        style({ opacity: 0, height: 0 }),
        animate('500ms ease-out', style({ opacity: 1, height: '*' }))
      ]),
      transition(':leave', [
        // style({ opacity: 1, height: '*' }),
        animate('500ms ease-out', style({ opacity: 0, height: 0 }))
      ])
    ])
  ],
})
export class SidebarComponent {

  collapsed = signal(false);
  router = inject(Router);

  isActive(route: string): boolean {
    return this.router.url === route; //or includes or startsWith depending on the logic.
  }

  logout() {
    localStorage.removeItem('email');
    this.router.navigateByUrl('login');
  }

}
