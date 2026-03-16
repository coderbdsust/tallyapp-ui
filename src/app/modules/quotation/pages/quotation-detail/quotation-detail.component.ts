import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { Quotation, QuotationTableResponse, InvoiceStatus, InvoiceType } from '../../quotation.model';
import { QuotationService } from 'src/app/core/services/quotation.service';
import { ToWords } from 'to-words';

@Component({
  selector: 'app-quotation-detail',
  standalone: true,
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './quotation-detail.component.html',
  styleUrl: './quotation-detail.component.scss'
})
export class QuotationDetailComponent implements OnInit, OnDestroy {
  invoice: Quotation | null = null;
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
    private quotationService: QuotationService
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
        this.router.navigate(['/quotation/list']);
        return;
      }

      this.fetchInvoice();
    });
  }

  private fetchInvoice(): void {
    this.loading = true;
    this.quotationService.getInvoiceById(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invoice => {
          this.invoice = invoice;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.quotationService.showToastErrorResponse(err);
          this.router.navigate(['/quotation/list']);
        }
      });
  }

  editInvoice(): void {
    this.router.navigate(['/quotation/add'], {
      queryParams: { orgId: this.orgId, invoiceId: this.invoiceId }
    });
  }

  backToList(): void {
    this.router.navigate(['/quotation/list']);
  }

  downloadInvoice(): void {
    this.quotationService.downloadInvoice(this.orgId, this.invoiceId)
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
          this.quotationService.showToastErrorResponse(err);
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
    return 'bg-purple-100 text-purple-800';
  }

  getTotalProductAmount(quantity: number, price: number, discountPercent: number): number {
    return quantity * price;
  }

  hasProducts(): boolean {
    return !!(this.invoice?.products?.items && this.invoice.products.items.length > 0);
  }

  hasPayments(): boolean {
    return !!(this.invoice?.payments?.payments && this.invoice.payments.payments.length > 0);
  }

  canModify (invoice: QuotationTableResponse):boolean {
      return invoice.invoiceStatus !== InvoiceStatus.PAID;
  }

}
