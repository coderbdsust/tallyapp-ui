import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Customer } from '../../invoice.model';
import { Organization } from 'src/app/core/models/organization.model';
import { CustomerService } from 'src/app/core/services/customer.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-customer-list',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent extends PaginatedComponent<Customer> implements OnInit, OnDestroy {
  search: string = '';
  loading: boolean = false;
  organization!: Organization;
  showDrawer = false;
  isEditMode = false;
  customerForm!: FormGroup;

  private destroy$ = new Subject<void>();
  private formError: FormError;

  constructor(
    private customerService: CustomerService,
    private orgService: OrganizationService,
    private fb: FormBuilder
  ) {
    super();
    this.formError = new FormError();
    this.initForm();
  }

  ngOnInit(): void {
    this.subscribeToOrganization();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.customerService
      .getCustomerByOrganization(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.customerService.showToastErrorResponse(error);
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

  private initForm(customer: Customer | null = null): void {
    this.customerForm = this.fb.group({
      id: [customer?.id || ''],
      name: [customer?.name || '', Validators.required],
      mobile: [customer?.mobile || '', Validators.required],
      email: [customer?.email || ''],
      address: [customer?.address || ''],
      postcode: [customer?.postcode || '']
    });
  }

  onSearchChange(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  openCreateDrawer(): void {
    this.isEditMode = false;
    this.initForm();
    this.showDrawer = true;
  }

  openEditDrawer(customer: Customer): void {
    this.isEditMode = true;
    this.initForm(customer);
    this.showDrawer = true;
  }

  closeDrawer(): void {
    this.showDrawer = false;
    this.initForm();
  }

  saveCustomer(): void {
    if (this.customerForm.invalid) return;

    const formData = this.customerForm.value;

    if (this.isEditMode && formData.id) {
      this.customerService
        .editCustomer(this.organization.id, formData.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.customerService.showToastSuccess('Customer updated successfully');
            this.closeDrawer();
            this.loadData();
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    } else {
      this.customerService
        .createCustomer(this.organization.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.customerService.showToastSuccess('Customer created successfully');
            this.closeDrawer();
            this.loadData();
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    }
  }

  getCustomerIndex(index: number): number {
    return index + this.startIndex;
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }
}
