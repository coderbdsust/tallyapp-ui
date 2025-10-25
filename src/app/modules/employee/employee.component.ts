import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeExpenseComponent } from "./pages/employee-expense/employee-expense.component";
import { NgFor, NgIf } from '@angular/common';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeDailyReportingComponent } from './pages/employee-daily-reporting/employee-daily-reporting.component';
import { EmployeeIncomeComponent } from './pages/employee-income/employee-income.component';
import { EmployeeDailyReportingCalendarComponent } from "./pages/employee-daily-reporting-calendar/employee-daily-reporting-calendar.component";

@Component({
  selector: 'app-employee',
  imports: [
    EmployeeListComponent, 
    EmployeeExpenseComponent,
    EmployeeDailyReportingComponent, 
    EmployeeIncomeComponent, 
    EmployeeDailyReportingCalendarComponent, 
    NgIf, 
    NgFor, 
    EmployeeDailyReportingCalendarComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent {
  activeTab = 'employee';
  private subscription = new Subscription();

  tabs = [
    { id: 'employee', label: 'Employee' },
    { id: 'expense', label: 'Expense' },
    { id: 'daily-reporting', label: 'Daily Reporting' },
    { id: 'daily-reporting-calendar', label: 'Daily Reporting Calendar' },
    { id: 'income', label: 'Income' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    // Subscribe to query parameter changes
    const queryParamSub = this.route.queryParams.subscribe(params => {
      // console.log('Transaction component received query params:', params);

      const tab = params['tab'];
      if (tab && this.tabs.some(t => t.id === tab)) {
        this.activeTab = tab;
        // console.log('Setting active tab to:', tab);
      } else {
        // If no valid tab specified, default to cash-in and update URL
        this.activeTab = 'employee';
        this.updateQueryParam('employee', true); // true = replace URL
      }
    });

    this.subscription.add(queryParamSub);
  }

  setActiveTab(tabId: string) {
    // console.log('Setting active tab via click:', tabId);
    this.activeTab = tabId;
    this.updateQueryParam(tabId, false); // false = don't replace URL
  }

  private updateQueryParam(tabId: string, replaceUrl: boolean = false) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tabId },
      queryParamsHandling: 'replace', // Always replace to ensure clean URL
      replaceUrl: replaceUrl // Only replace browser history on initial load
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
