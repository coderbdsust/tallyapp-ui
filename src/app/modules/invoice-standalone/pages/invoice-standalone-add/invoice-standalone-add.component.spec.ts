import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStandaloneAddComponent } from './invoice-standalone-add.component';

describe('InvoiceStandaloneAddComponent', () => {
  let component: InvoiceStandaloneAddComponent;
  let fixture: ComponentFixture<InvoiceStandaloneAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceStandaloneAddComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStandaloneAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
