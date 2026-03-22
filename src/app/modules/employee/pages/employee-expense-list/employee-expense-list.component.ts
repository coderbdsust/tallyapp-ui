import {
  Component, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { EmployeeExpense } from 'src/app/core/models/employee-expense.model';
import { EmployeeExpenseService } from 'src/app/core/services/employee-expense.service';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';

@Component({
  selector: 'app-employee-expense-list',
  imports: [CommonModule, FormsModule, AngularSvgIconModule, TranslateModule],
  templateUrl: './employee-expense-list.component.html',
  styleUrl: './employee-expense-list.component.scss',
})
export class EmployeeExpenseListComponent
  extends PaginatedComponent<EmployeeExpense>
  implements OnInit, OnChanges, OnDestroy
{
  @Input() orgId!: string;
  @Input() reload: boolean = false;

  @Output() approve = new EventEmitter<string>();
  @Output() reject = new EventEmitter<string>();

  // Filter params sent to API
  filterFromDate: string = '';
  filterToDate: string = '';
  filterStatus: string = '';

  loading: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private readonly empExpenseService: EmployeeExpenseService) {
    super();
  }

  ngOnInit(): void {
    if (this.orgId) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['orgId'] && !changes['orgId'].firstChange) || changes['reload']) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  override loadData(): void {
    if (!this.orgId) return;

    this.loading = true;
    this.empExpenseService
      .getEmployeeExpenses(
        this.orgId,
        this.currentPage,
        this.selectedRows,
        this.filterFromDate,
        this.filterToDate,
        this.filterStatus,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.empExpenseService.showToastErrorResponse(error);
          this.loading = false;
        },
      });
  }

  clearFilters(): void {
    this.filterFromDate = '';
    this.filterToDate = '';
    this.filterStatus = '';
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  onApprove(expenseId: string): void {
    this.approve.emit(expenseId);
  }

  onReject(expenseId: string): void {
    this.reject.emit(expenseId);
  }
}