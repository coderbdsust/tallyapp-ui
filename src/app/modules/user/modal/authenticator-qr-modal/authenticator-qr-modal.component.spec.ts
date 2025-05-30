import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthenticatorQrModalComponent } from './authenticator-qr-modal.component';

describe('AuthenticatorQrModalComponent', () => {
  let component: AuthenticatorQrModalComponent;
  let fixture: ComponentFixture<AuthenticatorQrModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthenticatorQrModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthenticatorQrModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
