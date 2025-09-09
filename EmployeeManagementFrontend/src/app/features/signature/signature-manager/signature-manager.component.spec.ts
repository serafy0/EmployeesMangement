import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureManagerComponent } from './signature-manager.component';

describe('SignatureManagerComponent', () => {
  let component: SignatureManagerComponent;
  let fixture: ComponentFixture<SignatureManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignatureManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignatureManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
