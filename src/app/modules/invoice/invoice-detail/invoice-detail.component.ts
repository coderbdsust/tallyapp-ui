import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import * as jsPdf from 'jspdf';
import html2canvas from 'html2canvas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invoice-detail',
  imports: [AngularSvgIconModule, CommonModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent {

  downloadPdf() {
    console.log('Downloading invoice as PDF...');

    const invoiceElement = document.getElementById('invoiceDetailContainer');
    const sectionToRemove = document.getElementById('buttonSection');

    if (!invoiceElement) return;

    if (sectionToRemove) sectionToRemove.style.display = 'none';

    // Increase scale for higher resolution
    html2canvas(invoiceElement, {
      scale: 2, // Reduce from 4 to 2
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
      .then((canvas) => {
        if (sectionToRemove) sectionToRemove.style.display = '';

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPdf.jsPDF('p', 'mm', 'a4');

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Reduce margins to make content larger
        const margin = 5; // Reduced from 10mm
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
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        if (sectionToRemove) sectionToRemove.style.display = '';
      });
  }

}
