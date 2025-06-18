import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarlicenciaComponent } from './validarlicencia.component';

describe('ValidarlicenciaComponent', () => {
  let component: ValidarlicenciaComponent;
  let fixture: ComponentFixture<ValidarlicenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidarlicenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidarlicenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
