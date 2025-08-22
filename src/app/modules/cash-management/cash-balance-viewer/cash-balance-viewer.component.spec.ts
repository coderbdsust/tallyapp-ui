import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashBalanceViewerComponent } from './cash-balance-viewer.component';

describe('CashBalanceViewerComponent', () => {
  let component: CashBalanceViewerComponent;
  let fixture: ComponentFixture<CashBalanceViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashBalanceViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashBalanceViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
