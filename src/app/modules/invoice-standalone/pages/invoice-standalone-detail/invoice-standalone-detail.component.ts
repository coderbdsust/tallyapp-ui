import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { InvoiceStandalone, InvoiceStandaloneTableResponse, InvoiceStatus, InvoiceType } from '../../invoice-standalone.model';
import { InvoiceStandaloneService } from 'src/app/core/services/invoice-standalone.service';
import { ToWords } from 'to-words';

@Component({
  selector: 'app-invoice-standalone-detail',
  standalone: true,
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './invoice-standalone-detail.component.html',
  styleUrl: './invoice-standalone-detail.component.scss'
})
export class InvoiceStandaloneDetailComponent implements OnInit, OnDestroy {
  invoice: InvoiceStandalone | null = null;
  loading: boolean = false;
  orgId: string = '';
  invoiceId: string = '';
  formatCurrency = formatCurrency;
   toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
      currency: true,
      ignoreDecimal: true
    },
  });

  readonly InvoiceType = InvoiceType;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceStandaloneService: InvoiceStandaloneService
  ) {}

  ngOnInit(): void {
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleRouteParams(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.orgId = params['orgId'];
      this.invoiceId = params['invoiceId'];

      if (!this.orgId || !this.invoiceId) {
        this.router.navigate(['/quotation-bill/list']);
        return;
      }

      this.fetchInvoice();
    });
  }

  private fetchInvoice(): void {
    this.loading = true;
    this.invoiceStandaloneService.getInvoiceById(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invoice => {
          this.invoice = invoice;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.invoiceStandaloneService.showToastErrorResponse(err);
          this.router.navigate(['/quotation-bill/list']);
        }
      });
  }

  editInvoice(): void {
    this.router.navigate(['/quotation-bill/add'], {
      queryParams: { orgId: this.orgId, invoiceId: this.invoiceId }
    });
  }

  backToList(): void {
    this.router.navigate(['/quotation-bill/list']);
  }

  downloadInvoice(): void {
    this.invoiceStandaloneService.downloadInvoice(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          const blob = new Blob([pdfRes], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement('a');
          a.href = url;
          a.download = `${this.invoice?.invoiceNumber}.pdf`;
          a.click();

          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  printInvoice(): void {
    window.print();
  }

  getStatusColor(status: string): string {
    const statusMap: Record<string, string> = {
      'PAID': 'bg-green-100 text-green-800',
      'PARTIALLY_PAID': 'bg-yellow-100 text-yellow-800',
      'ISSUED': 'bg-blue-100 text-blue-800',
      'DRAFT': 'bg-gray-100 text-gray-800',
      'QUOTATION': 'bg-purple-100 text-purple-800'
    };
    return statusMap[status] || 'bg-gray-100 text-gray-800';
  }

  getTypeColor(): string {
    return this.invoice?.invoiceType === InvoiceType.QUOTATION
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  }

  getTotalProductAmount(quantity: number, price: number, discountPercent: number): number {
    return quantity * price;
  }

  canShowPayments(): boolean {
    return this.invoice?.invoiceType === InvoiceType.BILL;
  }

  getAmountDueColor(): string {
    if (!this.invoice) return 'text-gray-900';
    return this.invoice.remainingAmount > 0 ? 'text-red-600' : 'text-green-600';
  }

  hasProducts(): boolean {
    return !!(this.invoice?.products?.items && this.invoice.products.items.length > 0);
  }

  hasPayments(): boolean {
    return !!(this.invoice?.payments?.payments && this.invoice.payments.payments.length > 0);
  }

  canModify (invoice: InvoiceStandaloneTableResponse):boolean {
      return invoice.invoiceStatus !== InvoiceStatus.PAID;
  }
  

}