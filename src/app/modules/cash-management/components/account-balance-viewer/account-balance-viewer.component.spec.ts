import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountBalanceViewerComponent } from './account-balance-viewer.component';

describe('AccountBalanceViewerComponent', () => {
  let component: AccountBalanceViewerComponent;
  let fixture: ComponentFixture<AccountBalanceViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountBalanceViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountBalanceViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
