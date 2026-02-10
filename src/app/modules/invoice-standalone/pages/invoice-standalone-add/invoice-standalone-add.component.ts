// src/app/modules/invoice-standalone/invoice-standalone-add/invoice-standalone-add.component.ts

import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgSelectComponent } from '@ng-select/ng-select';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { ToWords } from 'to-words';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { 
  InvoiceStandalone,
  ProductItem,
  PaymentItem,
  InvoiceStatus,
  InvoiceType,
  UpdateCustomerRequest,
  AddProductRequest,
  AddPaymentRequest,
  UpdatePricingRequest
} from '../../invoice-standalone.model';
import { InvoiceStandaloneService } from 'src/app/core/services/invoice-standalone.service';
import { ProductService } from 'src/app/core/services/product.service';
import { Customer } from 'src/app/modules/invoice/invoice.model';
import { CustomerService } from 'src/app/core/services/customer.service';
import { Product, UnitType } from 'src/app/core/models/product.model';

@Component({
  selector: 'app-invoice-standalone-add',
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
  templateUrl: './invoice-standalone-add.component.html',
  styleUrl: './invoice-standalone-add.component.scss'
})
export class InvoiceStandaloneAddComponent extends FormError implements OnInit, OnDestroy {
  invoice: InvoiceStandalone | null = null;
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
  allProducts: (Product & { label?: string })[] = [];
  allCustomers: (Customer & { label?: string })[] = [];
  
  readonly allPaymentMethods = [
    'Cash',
    'Bank Transfer',
    'Mobile Banking',
    'Card',
    'Cheque',
    'Other'
  ];

  allUnitTypes: UnitType[]=[];

  readonly invoiceStatuses = Object.values(InvoiceStatus);
  readonly InvoiceStatus = InvoiceStatus;
  readonly InvoiceType = InvoiceType;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly invoiceStandaloneService: InvoiceStandaloneService,
    private readonly productService: ProductService,
    private readonly customerService: CustomerService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder
  ) { 
    super();
  }

  ngOnInit(): void {
    this.fetchUnitTypes();
    this.initForms();
    this.handleRouteParams();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.initiateInvoiceForm();
    this.initiatePaymentForm();
    this.initiateProductForm();
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

  private fetchUnitTypes():void{
    this.invoiceStandaloneService.getUnitTypes().pipe(takeUntil(this.destroy$))
      .subscribe({
        next: unitTypes => {
          this.allUnitTypes = unitTypes;
        },
        error: err => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  private fetchInvoice(): void {
    this.invoiceStandaloneService.getInvoiceById(this.orgId, this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: invoice => {
          this.invoice = invoice;
          this.initiateInvoiceForm(invoice);
        },
        error: err => {
          this.router.navigate(['/quotation-bill/list']);
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  private setupFormListeners(): void {
    // Product form listeners
    this.productForm.get('productUnitRate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateProductAmount());
    
    this.productForm.get('productQuantity')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateProductAmount());

    this.productForm.get('productDiscountPercent')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.calculateProductAmount());

    // Pricing form listeners with debounce
    this.invForm.get('totalDiscount')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updatePricing());
    
    this.invForm.get('deliveryCharge')?.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updatePricing());
  }

  initiateInvoiceForm(invoice: InvoiceStandalone | null = null): void {
    this.invForm = this.fb.group({
      id: [invoice?.id],
      invoiceDate: [invoice?.invoiceDate, Validators.required],
      invoiceStatus: [invoice?.invoiceStatus, Validators.required],
      deliveryDate: [invoice?.deliveryDate],

      customerId: [invoice?.customer?.customerId],
      customerName: [invoice?.customer?.name, Validators.required],
      customerMobile: [invoice?.customer?.mobile, Validators.required],
      customerEmail: [invoice?.customer?.email],
      customerAddressLine: [invoice?.customer?.address, Validators.required],
      customerPostcode: [invoice?.customer?.postcode],

      totalDiscount: [invoice?.pricing?.discount || 0],
      deliveryCharge: [invoice?.pricing?.deliveryCharge || 0]
    });
  }

  initiatePaymentForm(): void {
    this.paymentForm = this.fb.group({
      paymentDate: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      paymentRef: [''],
      paymentAmount: ['', [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });
  }

  initiateProductForm(): void {
    this.productForm = this.fb.group({
      productId: [''],
      productName: ['', Validators.required],
      productCode: [''],
      productDescription: [''],
      productUnitType: ['', Validators.required],
      productUnitRate: ['', [Validators.required, Validators.min(0)]],
      productDiscountPercent: [0, [Validators.required, Validators.min(0),Validators.max(100)]],
      productQuantity: ['', [Validators.required, Validators.min(0.01)]],
      productAmount: [0],
      productNotes: ['']
    });
  }

  // Customer Methods
  createNewCustomer(): void {
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
    if (!customer) return;

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
    if (searchKey.length < 3) {
      this.invoiceStandaloneService.showToastInfo('Please type at least 3 characters');
      return;
    }
    this.fetchCustomers(searchKey);
  }

  fetchCustomers(searchKey: string): void {
    const orgId = this.invoice?.organization.id;
    if (!orgId) return;

    this.customerService.getCustomerByOrganization(orgId, 0, 20, searchKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: page => {
          this.allCustomers = page.content.map(c => ({
            ...c,
            label: `${c.name} - ${c.mobile}`
          }));
        },
        error: err => console.error(err)
      });
  }

  // Product Methods
  onSelectProduct(product: Product): void {
    if (!product) {
      this.productForm.reset();
      return;
    }

    const discount = (product.unitPrice*1*product.discountPercent)/100;
    const productPrice = product.unitPrice*1 - discount;
    this.productForm.patchValue({
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      productDescription: product.description,
      productUnitType: product.unitType,
      productUnitRate: product.unitPrice,
      productDiscountPercent: product.discountPercent,
      productQuantity: 1,
      productAmount: productPrice
    });
  }

  calculateProductAmount(): void {
    const unitRate = +this.productForm.get('productUnitRate')?.value || 0;
    const quantity = +this.productForm.get('productQuantity')?.value || 0;
    const discountRate =  +this.productForm.get('productDiscountPercent')?.value || 0;
    const discount = (unitRate*quantity*discountRate)/100.0;
    const price = unitRate*quantity;
    this.productForm.patchValue({ productAmount: price-discount }, { emitEvent: false });
  }

  onSearchKeyType(event: Event): void {
    const searchKey = (event.target as HTMLInputElement).value;
    if (searchKey.length < 3) {
      this.invoiceStandaloneService.showToastInfo('Please type at least 3 characters');
      return;
    }
    this.fetchProducts(searchKey);
  }

  fetchProducts(searchKey: string): void {
    const orgId = this.invoice?.organization.id;
    if (!orgId) return;

    this.productService.getProductByOrganizationAndNameOrCode(orgId, 0, 20, searchKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: page => {
          this.allProducts = page.content.map(p => ({
            ...p,
            label: `${p.code} - ${p.name}`
          }));
        },
        error: err => console.error(err)
      });
  }

  submitProduct(): void {
    if (this.productForm.invalid) return;

    const productRequest: AddProductRequest = {
      productId: this.productForm.get('productId')?.value || undefined,
      name: this.productForm.get('productName')?.value,
      code: this.productForm.get('productCode')?.value || undefined,
      description: this.productForm.get('productDescription')?.value || undefined,
      category: this.productForm.get('productCategory')?.value || undefined,
      unitType: this.productForm.get('productUnitType')?.value,
      quantity: +this.productForm.get('productQuantity')?.value,
      pricePerUnit: +this.productForm.get('productUnitRate')?.value,
      discountPercent: +this.productForm.get('productDiscountPercent')?.value,
      notes: this.productForm.get('productNotes')?.value || undefined
    };

    this.invoiceStandaloneService.addProduct(this.invoiceId, productRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.initiateProductForm();
          this.invoiceStandaloneService.showToastSuccess('Product added successfully');
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  deleteProduct(product: ProductItem): void {
    this.invoiceStandaloneService.removeProduct(this.invoiceId, { itemId: product.itemId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.invoiceStandaloneService.showToastSuccess('Product removed successfully');
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  // Payment Methods
  submitPayment(): void {
    if (this.paymentForm.invalid || !this.invoice?.id) return;

    if (this.invoice.invoiceType === InvoiceType.QUOTATION) {
      this.invoiceStandaloneService.showToastError('Cannot add payment to quotation');
      return;
    }

    const paymentRequest: AddPaymentRequest = {
      paymentDate: this.paymentForm.get('paymentDate')?.value,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value,
      reference: this.paymentForm.get('paymentRef')?.value || undefined,
      amount: +this.paymentForm.get('paymentAmount')?.value,
      notes: this.paymentForm.get('notes')?.value || undefined
    };

    this.invoiceStandaloneService.addPayment(this.invoice.id, paymentRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.initiatePaymentForm();
          this.initiateInvoiceForm(this.invoice);
          this.invoiceStandaloneService.showToastSuccess('Payment added successfully');
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  deletePayment(payment: PaymentItem): void {
    this.invoiceStandaloneService.removePayment(this.invoiceId, payment.paymentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.invoiceStandaloneService.showToastSuccess('Payment removed successfully');
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  // Invoice Methods
  submitInvoice(): void {
    if (this.invForm.invalid) return;

    const customerRequest: UpdateCustomerRequest = {
      customerId: this.invForm.get('customerId')?.value || undefined,
      name: this.invForm.get('customerName')?.value,
      mobile: this.invForm.get('customerMobile')?.value,
      email: this.invForm.get('customerEmail')?.value || undefined,
      address: this.invForm.get('customerAddressLine')?.value,
      postcode: this.invForm.get('customerPostcode')?.value || undefined
    };

    this.invoiceStandaloneService.updateCustomer(this.invoiceId, customerRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.invoiceStandaloneService.showToastSuccess('Customer information updated');
          // Also update pricing after customer update
          this.updatePricingWithStatus();
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  private updatePricing(): void {
    if (!this.invoice) return;

    const pricingRequest: UpdatePricingRequest = {
      discount: +this.invForm.get('totalDiscount')?.value || 0,
      deliveryCharge: +this.invForm.get('deliveryCharge')?.value || 0
    };

    this.invoiceStandaloneService.updatePricing(this.invoiceId, pricingRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
        },
        error: (err) => {
          console.error('Error updating pricing', err);
        }
      });
  }

  private updatePricingWithStatus(): void {
    if (!this.invoice) return;

    const pricingRequest: UpdatePricingRequest = {
      discount: +this.invForm.get('totalDiscount')?.value || 0,
      deliveryCharge: +this.invForm.get('deliveryCharge')?.value || 0,
      invoiceStatus: this.invForm.get('invoiceStatus')?.value,
      invoiceDate: this.invForm.get('invoiceDate')?.value,
      deliveryDate: this.invForm.get('deliveryDate')?.value
    };

    this.invoiceStandaloneService.updatePricing(this.invoiceId, pricingRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.invoice = updated;
        },
        error: (err) => {
          console.error('Error updating pricing with status', err);
        }
      });
  }

  // Navigation Methods
  previewInvoice(): void {
    this.router.navigate(['/quotation-bill/detail'], { 
      queryParams: { orgId: this.orgId, invoiceId: this.invoiceId } 
    });
  }

  backToInvoiceList(): void {
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

  convertToBill(): void {
    if (this.invoice?.invoiceType !== InvoiceType.QUOTATION) return;

    this.invoiceStandaloneService.convertQuotationToBill(this.invoiceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newBill) => {
          this.invoiceStandaloneService.showToastSuccess('Quotation converted to bill');
          this.router.navigate(['/quotation-bill/add'], {
            queryParams: { orgId: this.orgId, invoiceId: newBill.id }
          });
        },
        error: (err) => {
          this.invoiceStandaloneService.showToastErrorResponse(err);
        }
      });
  }

  canModify(): boolean {
    return this.invoice?.invoiceStatus !== InvoiceStatus.PAID;
  }

  // Utility Methods
  canAddPayments(): boolean {
    return this.invoice?.invoiceType === InvoiceType.BILL;
  }

  canConvertToBill(): boolean {
    return this.invoice?.invoiceType === InvoiceType.QUOTATION;
  }

  getFilteredInvoiceStatuses(): InvoiceStatus[] {
    if (this.invoice?.invoiceType === InvoiceType.QUOTATION) {
      return [InvoiceStatus.DRAFT, InvoiceStatus.QUOTATION];
    }
    return this.invoiceStatuses;
  }
}