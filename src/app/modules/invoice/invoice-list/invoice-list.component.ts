import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { Invoice } from '../invoice.model';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../service/invoice.service';
import { OrganizationService } from '../../organization/service/organization.service';
import { Organization } from '../../organization/service/model/organization.model';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';

@Component({
  selector: 'app-invoice-list',
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent extends PaginatedComponent<Invoice> implements OnInit, OnDestroy {
  search: string = '';
  searchCriteria: string = '';
  loading: boolean = false;
  submitted = false;
  organization!: Organization;
  formatCurrency = formatCurrency;


  private destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private invoiceService: InvoiceService,
    private orgService: OrganizationService,
    public dialog: MatDialog
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
    this.invoiceService
      .getInvoiceByOrganization(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search,
        this.searchCriteria
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.invoiceService.showToastErrorResponse(error);
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

  // Invoice actions
  viewInvoice(invoice: Invoice): void {
    console.log('Viewing invoice:', invoice);
    this._router.navigate(['/invoice/detail'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  editInvoice(invoice: Invoice): void {
    console.log('Editing invoice:', invoice);
    this._router.navigate(['/invoice/add'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  deleteInvoice(invoice: Invoice): void {
    console.log('Deleting invoice:', invoice);
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${invoice.invoiceNumber} ${invoice.customer?.name || ''}?`
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceService
          .deleteInvoice(invoice.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              console.log(response);
              this.invoiceService.showToastSuccess('Invoice deleted successfully');
              this.loadData();
            },
            error: (errRes) => {
              this.invoiceService.showToastErrorResponse(errRes);
            },
          });
      }
    });
  }

  createInvoice(): void {
    console.log('Creating a new invoice');
    this.invoiceService
      .createInvoice(this.organization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoice) => {
          this._router.navigate(['/invoice/add'], {
            queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
          });
        },
        error: (err) => {
          this.invoiceService.showToastErrorResponse(err);
        }
      });
  }

  downloadInvoice(invoice: Invoice): void {
    console.log(invoice);
    this.invoiceService
      .downloadInvoice(this.organization.id, invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          const blob = new Blob([pdfRes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `invoice-${invoice.invoiceNumber || invoice.id}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url); // clean up the blob URL
        },
        error: (err) => {
          this.invoiceService.showToastErrorResponse(err);
        }
      });
  }

  // Utility methods
  getInvoiceIndex(index: number): number {
    return index + this.startIndex;
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'UNPAID': { bg: 'bg-red-100', text: 'text-red-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'OVERDUE': { bg: 'bg-orange-100', text: 'text-orange-800' },
      'ISSUED': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'DRAFT': { bg: 'bg-blue-100', text: 'text-blue-800' }
    };

    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getAmountColor(amount: number, type: 'due' | 'paid' | 'total'): string {
    switch (type) {
      case 'due':
        if (amount > 0) return 'text-red-600 font-semibold';
        return 'text-green-600';
      case 'paid':
        return amount > 0 ? 'text-green-600 font-semibold' : 'text-gray-500';
      case 'total':
        return 'text-blue-600 font-semibold';
      default:
        return 'text-gray-900';
    }
  }

  formatCustomerInfo(invoice: Invoice): string {
    if (!invoice.customer) return 'No customer';
    const name = invoice.customer.name || 'Unknown';
    const mobile = invoice.customer.mobile;
    return mobile ? `${name} (${mobile})` : name;
  }

  isOverdue(invoice: Invoice): boolean {
    if (!invoice.invoiceDate || invoice.invoiceStatus === 'PAID') return false;
    const invoiceDate = new Date(invoice.invoiceDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - invoiceDate.getTime()) / (1000 * 3600 * 24));
    return daysDiff > 30 && invoice.remainingAmount > 0; // Assuming 30 days payment term
  }
}