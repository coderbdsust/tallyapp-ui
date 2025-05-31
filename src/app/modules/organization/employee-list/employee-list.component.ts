import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { OrganizationService } from '../service/organization.service';
import { Organization } from '../service/model/organization.model';
import { AddEmployeeComponent } from '../drawer/add-employee/add-employee.component';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../service/model/employee.model';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';

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
export class EmployeeListComponent extends PaginatedComponent<Employee> {
  @ViewChild('employeeDrawer') employeeDrawer!: AddEmployeeComponent;
  search: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;
  allOrganizations: Organization[] = [];

  constructor(
    private orgService: OrganizationService,
    private empService: EmployeeService,
    public dialog: MatDialog,
  ) {
    super();
  }

  ngOnInit(): void {
    this.orgService.organization$.subscribe((org) => {
      if(org) {
        this.organization = org;
        this.loadEmployeeByOrganization(org.id, this.currentPage, this.selectedRows, this.search);
      }
    });
  }

  editEmployee(selectedEmployee: Employee) {
    this.employeeDrawer.openDrawer(selectedEmployee);
  }

  deleteEmployee(selectedEmployee: Employee) {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete ${selectedEmployee.fullName}?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.empService.deleteEmployee(selectedEmployee.id).subscribe({
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

  private loadEmployeeByOrganization(orgId: string, page: number, size: number, search: string) {
    this.loading = true;
    this.empService.getEmployeesByOrganization(orgId, page, size, search).subscribe({
      next: (response) => {
        this.pageResponse = response;
        this.currentPage = response.pageNo;
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.updatePagesArray();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.empService.showToastErrorResponse(error);
      },
    });
  }

  onSearchChange(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.loadEmployeeByOrganization(this.organization.id, 0, this.selectedRows, this.search);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
    this.loadEmployeeByOrganization(this.organization.id, 0, this.selectedRows, this.search);
  }

  onSelectOrganization(event:Event){
    const orgId = (event.target as HTMLSelectElement).value;
    this.organization = this.allOrganizations.find(org => org.id === orgId) || this.organization;
    this.loadEmployeeByOrganization(this.organization.id, 0, this.selectedRows, this.search);
  }

  goToPreviousPage() {
    if (!this.first) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage() {
    if (!this.last) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  private updatePagination() {
    this.loadEmployeeByOrganization(this.organization.id, this.currentPage, this.selectedRows, this.search);
  }

  onAddOrganization(org: Organization) {
    this.organization = org;
    this.allOrganizations.push(org);
  }

  onAddEmployee(emp: Employee) {
    this.updateInPage(emp, 'id');
  }

  openEmployeeDrawer() {
    this.employeeDrawer.openDrawer();
  }
}
