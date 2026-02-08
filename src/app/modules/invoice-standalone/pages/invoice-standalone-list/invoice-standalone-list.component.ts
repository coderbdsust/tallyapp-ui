import { Component, OnInit, OnDestroy } from '@angular/core';
import { PaginatedComponent } from 'src/app/common/components/pagination/paginated.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { InvoiceStandaloneTableResponse, InvoiceType, InvoiceStatus } from '../../invoice-standalone.model';
import { Organization } from 'src/app/core/models/organization.model';
import { InvoiceStandaloneService } from 'src/app/core/services/invoice-standalone.service';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoice-standalone-list',
  standalone: true,
  imports: [AngularSvgIconModule, CommonModule, WordPipe, FormsModule],
  templateUrl: './invoice-standalone-list.component.html',
  styleUrl: './invoice-standalone-list.component.scss'
})
export class InvoiceStandaloneListComponent 
  extends PaginatedComponent<InvoiceStandaloneTableResponse> 
  implements OnInit, OnDestroy {
  
  search: string = '';
  selectedInvoiceType: InvoiceType | null = null;
  loading: boolean = false;
  organization!: Organization;
  formatCurrency = formatCurrency;

  readonly InvoiceType = InvoiceType;
  readonly invoiceTypes = Object.values(InvoiceType);

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private invoiceStandaloneService: InvoiceStandaloneService,
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

  loadData(): void {
    if (!this.organization) return;

    this.loading = true;
    this.invoiceStandaloneService
      .getInvoicesForTable(
        this.organization.id,
        this.currentPage,
        this.selectedRows,
        this.search,
        this.selectedInvoiceType || undefined
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.updatePaginationState(response);
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.invoiceStandaloneService.showToastErrorResponse(error);
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
    const input = (event.target as HTMLInputElement).value;
    this.search = input;
    this.onFilterChange();
  }

  onSelectChange(event: Event): void {
    const rows = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange(rows);
  }

  onInvoiceTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedInvoiceType = value ? (value as InvoiceType) : null;
    this.onFilterChange();
  }

  createInvoice(invoiceType: InvoiceType): void {
    this.invoiceStandaloneService
      .createInvoice({
        organizationId: this.organization.id,
        invoiceType: invoiceType
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (invoice) => {
          this.router.navigate(['/quotation-bill/add'], {
            queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
          });
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  viewInvoice(invoice: InvoiceStandaloneTableResponse): void {
    this.router.navigate(['/quotation-bill/detail'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  editInvoice(invoice: InvoiceStandaloneTableResponse): void {
    this.router.navigate(['/quotation-bill/add'], {
      queryParams: { orgId: this.organization.id, invoiceId: invoice.id }
    });
  }

  deleteInvoice(invoice: InvoiceStandaloneTableResponse): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        message: `Are you sure you want to delete ${invoice.invoiceNumber}?`
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceStandaloneService
          .deleteInvoice(invoice.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              this.invoiceStandaloneService.showToastSuccess(response.message);
              this.loadData();
            },
            error: (errRes) => {
              this.invoiceStandaloneService.showToastErrorResponse(errRes);
            },
          });
      }
    });
  }

  convertToBill(invoice: InvoiceStandaloneTableResponse): void {
    if (invoice.invoiceType !== InvoiceType.QUOTATION) {
      this.invoiceStandaloneService.showToastError('Only quotations can be converted to bills');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: {
        message: `Convert quotation ${invoice.invoiceNumber} to bill?`
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.invoiceStandaloneService
          .convertQuotationToBill(invoice.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (newBill) => {
              this.invoiceStandaloneService.showToastSuccess('Quotation converted to bill successfully');
              this.router.navigate(['/quotation-bill/add'], {
                queryParams: { orgId: this.organization.id, invoiceId: newBill.id }
              });
            },
            error: (errRes) => {
              this.invoiceStandaloneService.showToastErrorResponse(errRes);
            },
          });
      }
    });
  }

  downloadInvoice(invoice: InvoiceStandaloneTableResponse): void {
    this.invoiceStandaloneService
      .downloadInvoice(this.organization.id, invoice.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          const blob = new Blob([pdfRes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${invoice.invoiceNumber}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'ISSUED': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'DRAFT': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'QUOTATION': { bg: 'bg-purple-100', text: 'text-purple-800' }
    };

    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  getTypeColor(type: InvoiceType): { bg: string; text: string } {
    return type === InvoiceType.QUOTATION
      ? { bg: 'bg-purple-100', text: 'text-purple-800' }
      : { bg: 'bg-blue-100', text: 'text-blue-800' };
  }

  getAmountColor(amount: number, type: 'due' | 'paid' | 'total'): string {
    switch (type) {
      case 'due':
        return amount > 0 ? 'text-red-600 font-semibold' : 'text-green-600';
      case 'paid':
        return amount > 0 ? 'text-green-600 font-semibold' : 'text-gray-500';
      case 'total':
        return 'text-blue-600 font-semibold';
      default:
        return 'text-gray-900';
    }
  }

  canShowPayments(invoice: InvoiceStandaloneTableResponse): boolean {
    return invoice.invoiceType === InvoiceType.BILL;
  }

  canConvertToBill(invoice: InvoiceStandaloneTableResponse): boolean {
    return invoice.invoiceType === InvoiceType.QUOTATION;
  }
}