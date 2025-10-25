import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionRecentViewComponent } from './transaction-recent-view.component';

describe('TransactionRecentViewComponent', () => {
  let component: TransactionRecentViewComponent;
  let fixture: ComponentFixture<TransactionRecentViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionRecentViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionRecentViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
