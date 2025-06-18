import { effect, inject, signal } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

export const isLoggedIn = signal<boolean>(false);
const emailUser = signal<string | null>(null);

export const authGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const storeEmail = localStorage.getItem('email');

  const isAtuhenticated = !!storeEmail;
  isLoggedIn.set(isAtuhenticated);

  if (isAtuhenticated) {
    emailUser.set(storeEmail);
  } else {
    emailUser.set(null);
    router.navigate(['/login']);
    return false;
  }

  effect(() => {
    if(isLoggedIn()) {
      console.log('El usuario esta autenticado');
    }
  })

  return true;
};
