import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgSelectComponent } from '@ng-select/ng-select';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { Customer, Invoice, Payment, ProductSale } from '../../invoice.model';
import { ToWords } from 'to-words';
import { Product } from 'src/app/core/models/product.model';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { ProductService } from 'src/app/core/services/product.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { CustomerService } from 'src/app/core/services/customer.service';


@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    WordPipe,
    NgSelectComponent
],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss'
})
export class AddInvoiceComponent extends FormError implements OnInit {
  invoice: Invoice | null = null;
  invForm!: FormGroup;
  paymentForm!: FormGroup;
  productForm!: FormGroup;
  toWords = new ToWords({
    localeCode: 'en-BD',
    converterOptions: {
      currency: true,
      ignoreDecimal: true
    },
  });

  orgId = '';
  invoiceId = '';
  allProducts: Product[] = [];
  allCustomers:Customer[] = [];
  readonly allPaymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Banking',
    'Card',
    'Cheque',
    'Other'
  ];

  readonly invoiceStatus = [
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID'
  ];

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
    private readonly customerService: CustomerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) { super();}

  ngOnInit(): void {
    this.initForms();
    this.handleRouteParams();
    this.listenProductFormChanges();
  }

  private initForms(): void {
    this.initiateInvoiceForm();
    this.initiatePaymentForm();
    this.initiateProductForm();
  }

  private handleRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      this.orgId = params['orgId'];
      this.invoiceId = params['invoiceId'];

      if (!this.orgId || !this.invoiceId) {
        this.router.navigate(['/invoice/list']);
        return;
      }
      
      this.fetchInvoice();
    });
  }

  private fetchInvoice(): void {
    this.invoiceService.getInvoiceById(this.orgId, this.invoiceId).subscribe({
      next: invoice => {
        this.invoice = invoice;
        this.initiateInvoiceForm(invoice);
      },
      error: err => {
        this.router.navigate(['/invoice/list']);
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }

  private listenProductFormChanges(): void {
    this.productForm.get('productUnitRate')?.valueChanges.subscribe(() => this.calculateProductAmount());
    this.productForm.get('productQuantity')?.valueChanges.subscribe(() => this.calculateProductAmount());
  }

  initiateInvoiceForm(invoice: Invoice | null = null): void {
    this.invForm = this.fb.group({
      id: [invoice?.id],
      invoiceDate: [invoice?.invoiceDate, Validators.required],
      invoiceStatus: [invoice?.invoiceStatus, Validators.required],

      customerId: [invoice?.customer?.id],
      customerName: [invoice?.customer?.name, Validators.required],
      customerMobile: [invoice?.customer?.mobile, Validators.required],
      customerEmail: [invoice?.customer?.email],
      customerAddressLine: [invoice?.customer?.address, Validators.required],
      customerPostcode: [invoice?.customer?.postcode],

      totalDiscount: [invoice?.totalDiscount],
      deliveryCharge: [invoice?.deliveryCharge],
      deliveryDate: [invoice?.deliveryDate]
    });
  }

  initiatePaymentForm(): void {
    this.paymentForm = this.fb.group({
      paymentId: [],
      paymentDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      paymentRef: [''],
      paymentAmount: ['', Validators.required]
    });
  }

  initiateProductForm(product: Product | null = null): void {
    this.productForm = this.fb.group({
      productId: [product?.id],
      productName: [product?.name, Validators.required],
      productDescription: [product?.description, Validators.required],
      productUnitRate: [product?.unitPrice, Validators.required],
      productDiscountPercent: [product?.discountPercent, [Validators.required, Validators.min(0), Validators.max(100)]],
      productQuantity: [product?.availableQuantity, [Validators.required, Validators.min(1)]],
      productAmount: [0]
    });
  }

  createNewCustomer(){
    this.invForm.patchValue({
      customerId: '',
      customerName: '',
      customerMobile: '',
      customerEmail: '',
      customerAddressLine: '',
      customerPostcode: ''
    });
  }

  onSelectCustomer(customer: Customer): void {
    if (!customer) {
      return;
    }

    this.invForm.patchValue({
      customerId: customer.id,
      customerName: customer.name,
      customerMobile: customer.mobile,
      customerEmail: customer.email,
      customerAddressLine: customer.address,
      customerPostcode: customer.postcode
    });
  }

  onCustomerSearchKeyType(event: Event): void {
    const searchKey = (event.target as HTMLInputElement).value;
    if (searchKey.length < 4) {
      this.invoiceService.showToastInfo('Please type at least four (4) characters');
      return;
    }
    this.fetchCustomer(searchKey);
  }

  fetchCustomer(searchKey:string){
     const orgId = this.invoice?.ownerOrganization.id;
    if (!orgId) return;

    this.customerService.getCustomerByOrganization(orgId, 0, 20, searchKey).subscribe({
      next: page => {
        this.allCustomers = page.content.map(c => ({
          ...c,
          label: `${c.name} - ${c.mobile}`
        }));
      },
      error: err => console.error(err)
    });

  }


  onSelectProduct(product: Product): void {
    if (!product) {
      this.productForm.reset();
      return;
    }

    this.productForm.patchValue({
      productId: product.id,
      productName: product.name,
      productDescription: product.description,
      productUnitRate: product.unitPrice,
      productDiscountPercent: product.discountPercent,
      productQuantity: 1,
      productAmount: product.unitPrice
    });

    const quantityControl = this.productForm.get('productQuantity');
    quantityControl?.setValidators([
      Validators.required,
      Validators.min(1),
      Validators.max(product.availableQuantity)
    ]);
    quantityControl?.updateValueAndValidity();
  }

  calculateProductAmount(): void {
    const rate = +this.productForm.get('productUnitRate')?.value || 0;
    const quantity = +this.productForm.get('productQuantity')?.value || 0;
    this.productForm.patchValue({ productAmount: rate * quantity }, { emitEvent: false });
  }

  onSearchKeyType(event: Event): void {
    const searchKey = (event.target as HTMLInputElement).value;
    if (searchKey.length < 3) {
      this.invoiceService.showToastInfo('Please type at least three (3) characters');
      return;
    }
    this.fetchProducts(searchKey);
  }

  fetchProducts(searchKey: string): void {
    const orgId = this.invoice?.ownerOrganization.id;
    if (!orgId) return;

    this.productService.getProductByOrganizationAndNameOrCode(orgId, 0, 20, searchKey).subscribe({
      next: page => {
        this.allProducts = page.content.map(p => ({
          ...p,
          label: `${p.code} - ${p.name} - ${p.madeBy.fullName}`
        }));
      },
      error: err => console.error(err)
    });
  }

  submitProduct(): void {
    if (this.productForm.invalid) return;
    let product = this.productForm.value;
    this.invoiceService.addProductToInvoice(this.invoiceId, product).subscribe({
      next: (inv) => {
        this.initiateProductForm();
        this.refreshInvoice();
      },
      error: (err) => {
        this.initiateProductForm();
        this.refreshInvoice();
        this.productService.showToastErrorResponse(err);
      }
    });
  }

  deleteProduct(prod: ProductSale) {
    this.invoiceService.removeProductFromInvoice(this.invoiceId, prod.id).subscribe({
      next:(apiRes)=>{
        this.refreshInvoice();
      },
      error:(err)=>{
        this.refreshInvoice();
        this.productService.showToastErrorResponse(err);
      }
    });

  }

  deletePayment(payment: Payment): void {
    this.paymentService.deletePayment(this.invoiceId, payment.id).subscribe({
      next: (apiRes) => {
        this.refreshInvoice();
      },error:(errorRes)=>{
        this.refreshInvoice();
        this.paymentService.showToastErrorResponse(errorRes);
      }
    });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.invoice?.id) return;

    const payment = this.paymentForm.value;
    this.paymentService.addPayment(this.invoice.id, payment).subscribe({
      next: () => {
        this.initiatePaymentForm();
        this.refreshInvoice();
      },
      error: (errorRes) => {
        this.refreshInvoice();
        this.paymentService.showToastErrorResponse(errorRes);
      }
    });
  }

  private refreshInvoice(): void {
    if (!this.orgId || !this.invoice?.id) return;
    this.invoiceService.getInvoiceById(this.orgId, this.invoice.id).subscribe({
      next: updated => {
        this.invoice = updated;
        this.initiateInvoiceForm(updated);
      },
      error: err => console.error('Error refreshing invoice', err)
    });
  }

  submitInvoice(): void {
    if (this.invForm.invalid) return;
    const invoice = this.invForm.value;
    this.invoiceService.updateInvoice(invoice.id, invoice).subscribe({
      next: updated => {
        this.invoice = updated;
        this.initiateInvoiceForm(updated);
      },
      error: (err) =>{
         this.refreshInvoice();
         this.invoiceService.showToastErrorResponse(err)
       }
    });
  }

  previewInvoice(){
    this.router.navigate(['/invoice/detail'], { queryParams: { orgId: this.orgId, invoiceId: this.invoiceId } }); 
  }

   backToInvoiceList(){
    this.router.navigate(['/invoice/list']);
  }

  downloadInvoice(){
      this.invoiceService.downloadInvoice(this.orgId, this.invoiceId).subscribe({
      next: (pdfRes: Blob) => {
        const blob = new Blob([pdfRes], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${this.invoice?.invoiceNumber || this.invoice?.id}.pdf`;
        a.click();

        window.URL.revokeObjectURL(url); // clean up the blob URL
      },
      error: (err) => {
        this.invoiceService.showToastErrorResponse(err);
      }
    });
  }
  
}
