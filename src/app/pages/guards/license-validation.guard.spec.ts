import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { licenseValidationGuard } from './license-validation.guard';

describe('licenseValidationGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => licenseValidationGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
