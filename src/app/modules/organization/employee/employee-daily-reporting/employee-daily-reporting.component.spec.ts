import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDailyReportingComponent } from './employee-daily-reporting.component';

describe('EmployeeDailyReportingComponent', () => {
  let component: EmployeeDailyReportingComponent;
  let fixture: ComponentFixture<EmployeeDailyReportingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDailyReportingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDailyReportingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
