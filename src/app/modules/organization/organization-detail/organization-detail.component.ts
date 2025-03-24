import { Component, CUSTOM_ELEMENTS_SCHEMA, Output, signal, ViewChild } from '@angular/core';
import { PageResponse } from 'src/app/common/models/page-response';
import { AuthService } from '../../auth/services/auth.service';
import { EditAppPropertiesComponent } from '../../admin/pages/app-properties/modal/edit-app-properties.component';
import { AppPropertiesService } from '../../admin/pages/app-properties/service/app-properties.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { OrganizationService } from '../service/organization.service';
import { AssignOrganizationComponent } from '../assign-organization/assign-organization.component';
import { Organization } from '../service/organization.model';
import { AddOrganizationComponent } from '../add-organization/add-organization.component';
import { OrgDrawerService } from '../service/org-drawer.service';
import { AddEmployeeComponent } from '../add-employee/add-employee.component';
import { EmployeeService } from '../service/employee.service';
import { Employee } from '../service/employee.model';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    AssignOrganizationComponent,
    AddOrganizationComponent,
    AddEmployeeComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './organization-detail.component.html',
  styleUrl: './organization-detail.component.scss',
})
export class OrganizationDetailComponent {
  @ViewChild('employeeDrawer') employeeDrawer!: AddEmployeeComponent;
  pageResponse = signal<PageResponse<Employee> | null>(null);
  selectedRows: number = 10;
  totalRows: number = 0;
  totalPages: number = 0;
  currentPage: number = 0;
  search: string = '';
  loading: boolean = false;
  pagesArray: number[] = [];
  @ViewChild('addEmployeeModal', { static: false }) addEmployeeModal!: EditAppPropertiesComponent;
  @ViewChild('assignOrganizationModal', { static: false }) assignOrganizationModal!: AssignOrganizationComponent;
  // employee!: Employee;
  submitted = false;
  errorMessage = '';
  organization!: Organization;

  constructor(
    private appPropService: AppPropertiesService,
    private authService: AuthService,
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private orgDrawerService: OrgDrawerService ) {}

  ngOnInit(): void {
    this.loadOrganization();
  }

  editEmployee(selectedEmployee: Employee) {
    this.employeeDrawer.openEmployeeDrawer(selectedEmployee);
  }

  deleteEmployee(selectedEmployee: Employee) {
    this.empService.deleteEmployee(selectedEmployee.id).subscribe({
      next:(response)=>{
        console.log(response);
      },error:(errRes)=>{
        this.empService.showToastErrorResponse(errRes);
      }
    });
  }

  private loadEmployeeByOrganization(orgId:string, page: number, size: number, search: string) {
    this.loading = true;
    this.empService.getEmployeesByOrganization(orgId, page, size, search).subscribe({
      next: (response) => {
        this.pageResponse.set(response);
        this.currentPage = response.pageNo;
        this.totalRows = response.totalElements;
        this.totalPages = response.totalPages;
        this.updatePagesArray();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.appPropService.showToastErrorResponse(error);
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

  get startIndex(): number {
    return this.currentPage * this.selectedRows + 1;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.selectedRows - 1, this.totalRows);
  }

  get first(): boolean {
    return this.currentPage === 0;
  }

  get last(): boolean {
    return this.currentPage === this.totalPages - 1;
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

  private updatePagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, index) => index);
  }

  getPagesArray(): number[] {
    return this.pagesArray;
  }

  assignOrganization() {
    this.assignOrganizationModal.openModal();
  }

  onAddOrganization(org: Organization) {
    this.organization = org;
  }

  onAddEmployee(emp:Employee){
    // this.employee = emp;
    this.updateEmployee(emp);
    
  }

  // Function to add or update an Employee and recalculate pagination
updateEmployee(updatedEmployee: Employee) {
  this.pageResponse.update((prev) => {
    if (!prev) return null; // If null, return as is

    let updatedContent = prev.content.map(emp =>
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    );

    // If the employee doesn't exist, add them
    const isExisting = prev.content.some(emp => emp.id === updatedEmployee.id);
    if (!isExisting) {
      updatedContent = [...prev.content, updatedEmployee];
    }

    // Recalculate pagination values
    const totalElements = updatedContent.length;
    const totalPages = Math.ceil(totalElements / prev.size);
    const first = prev.pageNo === 0;
    const last = prev.pageNo >= totalPages - 1;

    return {
      ...prev,
      content: updatedContent,
      totalElements,
      totalPages,
      first,
      last
    };
  });
}

  private loadOrganization() {
    this.orgService.getOrganizations().subscribe({
      next: (organizations) => {
        if (organizations && organizations.length > 0) {
          let org = organizations[0];
          this.organization = org;
          this.loadEmployeeByOrganization(org.id, 0, 10, '');
        }
      },
      error: () => {},
    });
  }

  openOrganizationDrawer() {
    this.orgDrawerService.openDrawer();
  }

  openEmployeeDrawer() {
    this.employeeDrawer.openEmployeeDrawer();
  }
}
