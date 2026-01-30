import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStandaloneListComponent } from './invoice-standalone-list.component';

describe('InvoiceStandaloneListComponent', () => {
  let component: InvoiceStandaloneListComponent;
  let fixture: ComponentFixture<InvoiceStandaloneListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceStandaloneListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoiceStandaloneListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
