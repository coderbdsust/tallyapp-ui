import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { PageResponse } from 'src/app/common/models/page-response';
import { EditAppPropertiesComponent } from '../../admin/pages/app-properties/modal/edit-app-properties.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../service/organization.service';
import { AssignOrganizationComponent } from '../assign-organization/assign-organization.component';
import { Organization } from '../service/organization.model';
import { AddOrganizationComponent } from '../add-organization/add-organization.component';
import { OrgDrawerService } from '../service/org-drawer.service';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../service/employee.model';
import { PaginatedComponent } from 'src/app/common/components/pagination/pagination.component';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AssignOrganizationComponent,
    AddOrganizationComponent,
    AddEmployeeComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './organization-detail.component.html',
  styleUrl: './organization-detail.component.scss',
})
export class OrganizationDetailComponent extends PaginatedComponent<Employee> {
  @ViewChild('employeeDrawer') employeeDrawer!: AddEmployeeComponent;
  @ViewChild('addEmployeeModal', { static: false }) addEmployeeModal!: EditAppPropertiesComponent;
  @ViewChild('assignOrganizationModal', { static: false }) assignOrganizationModal!: AssignOrganizationComponent;
  search: string = '';
  loading: boolean = false;
  submitted = false;
  errorMessage = '';
  organization!: Organization;

  constructor(
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private orgDrawerService: OrgDrawerService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadOrganization();
  }

  editEmployee(selectedEmployee: Employee) {
    this.employeeDrawer.openDrawer(selectedEmployee);
  }

  deleteEmployee(selectedEmployee: Employee) {
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
    this.orgService.showToastInfo('Not implemented');
    // const input = (event.target as HTMLInputElement).value;
    // this.search = input;
    // this.loadEmployeeByOrganization(this.organization.id, 0, this.selectedRows, this.search);
  }

  onSelectChange(event: Event) {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedRows = rows === -1 ? this.totalRows || 0 : rows;
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

  assignOrganization() {
    this.assignOrganizationModal.openModal();
  }

  onAddOrganization(org: Organization) {
    this.organization = org;
  }

  onAddEmployee(emp: Employee) {
    this.updateInPage(emp, 'id');
  }

  private loadOrganization() {
    this.orgService.getOrganizations().subscribe({
      next: (organizations) => {
        if (organizations && organizations.length > 0) {
          let org = organizations[0];
          this.organization = org;
          this.loadEmployeeByOrganization(org.id, this.currentPage, this.selectedRows, this.search);
        }
      },
      error: () => {},
    });
  }

  openOrganizationDrawer() {
    this.orgDrawerService.openDrawer();
  }

  openEmployeeDrawer() {
    this.employeeDrawer.openDrawer();
  }
}
