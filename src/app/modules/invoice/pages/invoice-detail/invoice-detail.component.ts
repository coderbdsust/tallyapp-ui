import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import * as jsPdf from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ToWords } from 'to-words';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { Invoice } from '../../invoice.model';
import { InvoiceService } from 'src/app/core/services/invoice.service';

@Component({
  selector: 'app-invoice-detail',
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  orgId: string = '';
  invoiceId: string = '';
  invoice!: Invoice;
  loading: boolean = false;
  downloadingPdf: boolean = false;
  downloadingBackend: boolean = false;
  formatCurrency = formatCurrency;

  private destroy$ = new Subject<void>();

  readonly toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
      currency: true,
      ignoreDecimal: true
    },
  });

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.handleRouteParams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleRouteParams(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orgId = params['orgId'];
        this.invoiceId = params['invoiceId'];

        if (!this.orgId || !this.invoiceId) {
          this.navigateToInvoiceList();
          this.invoiceService.showToastError("Invalid invoice parameters");
          return;
        }
        this.fetchInvoice();
      });
  }

  private fetchInvoice(): void {
    this.loading = true;
    this.invoiceService
      .getInvoiceById(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invoice => {
          this.invoice = invoice;
          this.loading = false;
        },
        error: err => {
          this.loading = false;
          this.navigateToInvoiceList();
          this.invoiceService.showToastErrorResponse(err);
        }
      });
  }

  async downloadPdf(): Promise<void> {
    if (this.downloadingPdf) return;

    const invoiceElement = document.getElementById('invoiceDetailContainer');
    const sectionToRemove = document.getElementById('buttonSection');
    const logo = document.querySelector('img[alt="Invoice Logo"]') as HTMLImageElement;

    if (!invoiceElement) {
      this.invoiceService.showToastError('Invoice content not found');
      return;
    }

    this.downloadingPdf = true;

    try {
      // Hide button section during PDF generation
      if (sectionToRemove) {
        sectionToRemove.style.display = 'none';
      }

      // Ensure logo is loaded before generating PDF
      await this.ensureImageLoaded(logo);

      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure cloned images are loaded
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach(img => {
            if (img.src.startsWith('data:')) return;
            img.crossOrigin = 'anonymous';
          });
        }
      });

      this.generatePdfFromCanvas(canvas);

    } catch (error) {
      console.error('Error generating PDF:', error);
      this.invoiceService.showToastError('Failed to generate PDF');
    } finally {
      // Restore button section
      if (sectionToRemove) {
        sectionToRemove.style.display = '';
      }
      this.downloadingPdf = false;
    }
  }

  private ensureImageLoaded(img: HTMLImageElement): Promise<void> {
    return new Promise((resolve) => {
      if (!img || img.complete) {
        resolve();
        return;
      }
      
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails to load
      
      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  }

  private generatePdfFromCanvas(canvas: HTMLCanvasElement): void {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPdf.jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = margin;
    let heightLeft = imgHeight;

    // Add first page
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin;
    }

    const fileName = `invoice-${this.invoice.invoiceNumber || this.invoice.id}-${new Date().getTime()}.pdf`;
    pdf.save(fileName);
    
    this.invoiceService.showToastSuccess('PDF downloaded successfully');
  }

  downloadInvoice(): void {
    if (this.downloadingBackend) return;

    this.downloadingBackend = true;
    this.invoiceService
      .downloadInvoice(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdfRes: Blob) => {
          this.handleBlobDownload(pdfRes);
          this.downloadingBackend = false;
        },
        error: (err) => {
          this.downloadingBackend = false;
          this.invoiceService.showToastErrorResponse(err);
        }
      });
  }

  private handleBlobDownload(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `invoice-${this.invoice.invoiceNumber || this.invoice.id}-official.pdf`;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the blob URL
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    
    this.invoiceService.showToastSuccess('Official invoice downloaded');
  }

  editInvoice(): void {
    this.router.navigate(['/invoice/add'], { 
      queryParams: { orgId: this.orgId, invoiceId: this.invoiceId } 
    });
  }

  backToInvoiceList(): void {
    this.navigateToInvoiceList();
  }

  private navigateToInvoiceList(): void {
    this.router.navigate(['/invoice/list']);
  }

  // Utility methods for template
  hasPayments(): boolean {
    return this.invoice?.payments && this.invoice.payments.length > 0;
  }

  hasProducts(): boolean {
    return this.invoice?.productSales && this.invoice.productSales.length > 0;
  }

  getStatusColor(): string {
    if (!this.invoice?.invoiceStatus) return 'text-gray-600';
    
    switch (this.invoice.invoiceStatus.toUpperCase()) {
      case 'PAID':
        return 'text-green-600';
      case 'UNPAID':
        return 'text-red-600';
      case 'PARTIALLY_PAID':
        return 'text-yellow-600';
      case 'OVERDUE':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  }

  getAmountDueColor(): string {
    const remaining = this.invoice?.remainingAmount || 0;
    return remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600';
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCompanyInfo(key: string): string {
    const org = this.invoice?.ownerOrganization;
    if (!org) return 'N/A';
    
    const value = (org as any)[key];
    return value || 'N/A';
  }

  getCustomerInfo(key: string): string {
    const customer = this.invoice?.customer;
    if (!customer) return 'N/A';
    
    const value = (customer as any)[key];
    return value || 'N/A';
  }
}