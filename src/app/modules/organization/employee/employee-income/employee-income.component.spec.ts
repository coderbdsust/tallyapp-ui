import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeIncomeComponent } from './employee-income.component';

describe('EmployeeIncomeComponent', () => {
  let component: EmployeeIncomeComponent;
  let fixture: ComponentFixture<EmployeeIncomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeIncomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
