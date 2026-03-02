import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeExpenseListComponent } from './employee-expense-list.component';

describe('EmployeeExpenseListComponent', () => {
  let component: EmployeeExpenseListComponent;
  let fixture: ComponentFixture<EmployeeExpenseListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeExpenseListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeExpenseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
