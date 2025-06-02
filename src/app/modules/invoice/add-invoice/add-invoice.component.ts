import { Component } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-add-invoice',
  imports: [AngularSvgIconModule],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss'
})
export class AddInvoiceComponent {

  createInvoice() {
    // Logic to create a new invoice
    console.log('Creating a new invoice...');
  }
  cancel() {  
    // Logic to cancel the invoice creation
    console.log('Invoice creation cancelled.');
  }

  saveDraft() {
    // Logic to save the invoice as a draft
    console.log('Invoice saved as draft.');
  }
  submitInvoice() {
    // Logic to submit the invoice
    console.log('Invoice submitted successfully.');
  }
}
