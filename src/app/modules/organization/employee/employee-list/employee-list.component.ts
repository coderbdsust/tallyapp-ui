import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { AddEmployeeComponent } from '../../drawer/add-employee/add-employee.component';
import { Employee } from '../../../../core/models/employee.model';
import { Organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { EmployeeService } from '../../../../core/services/employee.service';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';

@Component({
  selector: 'app-employee-list',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AddEmployeeComponent,
    WordPipe,
    NgIf
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent extends PaginatedComponent<Employee> implements OnInit, OnDestroy {
  @ViewChild('employeeDrawer') employeeDrawer!: AddEmployeeComponent;
  
  search: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;
  allOrganizations: Organization[] = [];
  formatCurrency = formatCurrency;

  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrganizationService,
    private empService: EmployeeService,
    public dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Abstract method implementation
  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.empService
      .getEmployeesByOrganization(this.organization.id, this.currentPage, this.selectedRows, this.search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.empService.showToastErrorResponse(error);
        },
      });
  }

  private subscribeToOrganization(): void {
    this.orgService.organization$
      .pipe(takeUntil(this.destroy$))
      .subscribe((org) => {
        if (org) {
          this.organization = org;
          this.loadData();
        }
      });
  }

  // Event handlers
  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  onSelectOrganization(event: Event): void {
    const orgId = (event.target as HTMLSelectElement).value;
    this.organization = this.allOrganizations.find(org => org.id === orgId) || this.organization;
    this.onFilterChange();
  }

  // Employee actions
  editEmployee(selectedEmployee: Employee): void {
    this.employeeDrawer.openDrawer(selectedEmployee);
  }

  deleteEmployee(selectedEmployee: Employee): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete ${selectedEmployee.fullName}?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.empService.deleteEmployee(selectedEmployee.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.removeFromPage(selectedEmployee.id, 'id');
              this.empService.showToastSuccess(response.message);
            },
            error: (errRes) => {
              this.empService.showToastErrorResponse(errRes);
            },
          });
      }
    });
  }

  openEmployeeDrawer(): void {
    this.employeeDrawer.openDrawer();
  }

  // Event callbacks
  onAddOrganization(org: Organization): void {
    this.organization = org;
    this.allOrganizations.push(org);
  }

  onAddEmployee(emp: Employee): void {
    this.updateInPage(emp, 'id');
  }

  // Utility methods
  getEmployeeIndex(index: number): number {
    return index + this.startIndex;
  }
}