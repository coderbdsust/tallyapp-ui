import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import * as jsPdf from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../service/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Invoice } from '../invoice.model';
import { ToWords } from 'to-words';
import { WordPipe } from 'src/app/common/pipes/word.pipe';

@Component({
  selector: 'app-invoice-detail',
  imports: [AngularSvgIconModule, CommonModule, WordPipe],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent {


  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) { }

  orgId: string = '';
  invoiceId: string = '';
  invoice!: Invoice;
  toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
      currency: true,
      ignoreDecimal: true
    },
  });

  ngOnInit(): void {
    this.handleRouteParams();
  }

  private handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      this.orgId = params['orgId'];
      this.invoiceId = params['invoiceId'];

      if (!this.orgId || !this.invoiceId) {
        this.router.navigate(['/invoice/list']);
        this.invoiceService.showToastError("Couldn't load invoice");
        return;
      }
      this.fetchInvoice();
    });
  }

  private fetchInvoice(): void {
    this.invoiceService.getInvoiceById(this.orgId, this.invoiceId).subscribe({
      next: invoice => {
        this.invoice = invoice;
      },
      error: err => {
        this.router.navigate(['/invoice/list']);
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }

  downloadPdf() {
    const invoiceElement = document.getElementById('invoiceDetailContainer');
    const sectionToRemove = document.getElementById('buttonSection');
    const logo = document.querySelector('img[alt="Invoice Logo"]') as HTMLImageElement;

    if (!invoiceElement) return;
    if (sectionToRemove) sectionToRemove.style.display = 'none';

    const render = () => {
      html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      }).then((canvas) => {
        if (sectionToRemove) sectionToRemove.style.display = '';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPdf.jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const margin = 5;
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let position = margin;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight + margin;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
          heightLeft -= pageHeight - margin;
        }

        pdf.save('invoice-detail.pdf');
      }).catch((error) => {
        console.error('Error generating PDF:', error);
        if (sectionToRemove) sectionToRemove.style.display = '';
      });
    };

    // Wait for image to load if not yet complete
    if (!logo || !logo.complete) {
      logo.onload = render;
    } else {
      render();
    }
  }

  downloadInvoice(){
      this.invoiceService.downloadInvoice(this.orgId, this.invoiceId).subscribe({
      next: (pdfRes: Blob) => {
        const blob = new Blob([pdfRes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.invoice.invoiceNumber || this.invoice.id}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url); // clean up the blob URL
      },
      error: (err) => {
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }

  editInvoice(){
    this.router.navigate(['/invoice/add'], { queryParams: { orgId: this.orgId, invoiceId: this.invoiceId } }); 
  }

  backToInvoiceList(){
    this.router.navigate(['/invoice/list']);
  }


}
