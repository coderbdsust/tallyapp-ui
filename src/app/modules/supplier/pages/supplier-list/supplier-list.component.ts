import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { Supplier } from '../../supplier.model';
import { Organization } from 'src/app/core/models/organization.model';
import { SupplierService } from 'src/app/core/services/supplier.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { AddSupplierComponent } from '../../drawer/add-supplier/add-supplier.component';

@Component({
  selector: 'app-supplier-list',
  imports: [AngularSvgIconModule, CommonModule, AddSupplierComponent],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent extends PaginatedComponent<Supplier> implements OnInit, OnDestroy {
  @ViewChild(AddSupplierComponent) addSupplierDrawer!: AddSupplierComponent;

  search: string = '';
  loading: boolean = false;
  organization!: Organization;
  formatCurrency = formatCurrency;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private supplierService: SupplierService,
    private orgService: OrganizationService
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

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.supplierService
      .searchSuppliers(this.organization.id, this.search, this.currentPage, this.selectedRows)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.supplierService.showToastErrorResponse(error);
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

  onSearchChange(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  openAddDrawer(): void {
    this.addSupplierDrawer.openDrawer(null);
  }

  editSupplier(supplier: Supplier): void {
    this.addSupplierDrawer.openDrawer(supplier);
  }

  downloadReport(supplier: Supplier): void {
   this.supplierService
      .downloadReport(this.organization.id, supplier.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          const blob = new Blob([pdfRes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `SP-${supplier.id}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (errRes) => {
          this.supplierService.showToastErrorResponse(errRes);
        }
      });
  }

  onSupplierSaved(supplier: Supplier): void {
    this.loadData();
  }

  getBalanceColor(balance: number): string {
    if (balance > 0) return 'text-red-600 font-semibold';
    return 'text-green-600';
  }
}
