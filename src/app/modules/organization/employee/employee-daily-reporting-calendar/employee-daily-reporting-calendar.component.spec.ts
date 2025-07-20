import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDailyReportingCalendarComponent } from './employee-daily-reporting-calendar.component';

describe('EmployeeDailyReportingCalendarComponent', () => {
  let component: EmployeeDailyReportingCalendarComponent;
  let fixture: ComponentFixture<EmployeeDailyReportingCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDailyReportingCalendarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDailyReportingCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
