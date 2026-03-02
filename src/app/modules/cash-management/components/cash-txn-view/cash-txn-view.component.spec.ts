import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashTxnViewComponent } from './cash-txn-view.component';

describe('CashTxnViewComponent', () => {
  let component: CashTxnViewComponent;
  let fixture: ComponentFixture<CashTxnViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CashTxnViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CashTxnViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
