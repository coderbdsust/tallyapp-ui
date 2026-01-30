import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStandaloneDetailComponent } from './invoice-standalone-detail.component';

describe('InvoiceStandaloneDetailComponent', () => {
  let component: InvoiceStandaloneDetailComponent;
  let fixture: ComponentFixture<InvoiceStandaloneDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceStandaloneDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStandaloneDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
