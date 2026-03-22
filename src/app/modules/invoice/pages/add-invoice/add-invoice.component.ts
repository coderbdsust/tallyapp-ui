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
import { CreateAndAddProductRequest, Product, ProductCategory, UnitType } from 'src/app/core/models/product.model';
import { Employee } from 'src/app/core/models/employee.model';
import { InvoiceService } from 'src/app/core/services/invoice.service';
import { ProductService } from 'src/app/core/services/product.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { CustomerService } from 'src/app/core/services/customer.service';
import { EmployeeService } from 'src/app/core/services/employee.service';
import { ProductCategoryService } from 'src/app/core/services/product-category.service';
import { generateRandomLuhnCode } from 'src/app/common/utils/LuhnCode';
import { TranslateModule } from '@ngx-translate/core';
import { combineLatest, startWith, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ReasonModalComponent } from 'src/app/common/components/reason-modal/reason-modal.component';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';


@Component({
  selector: 'app-add-invoice',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    WordPipe,
    NgSelectComponent,
    TranslateModule
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
  createProductForm!: FormGroup;
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
  allCustomers: Customer[] = [];
  allEmployees: Employee[] = [];
  allProductCategories: ProductCategory[] = [];
  unitTypes: UnitType[] = [];
  isCreatingNewProduct = false;
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

  get isPaid(): boolean {
    return this.invoice?.invoiceStatus === 'PAID';
  }

  private productFormSubscription?: Subscription;
  private createProductFormSubscription?: Subscription;

  ngOnDestroy(): void {
    this.productFormSubscription?.unsubscribe();
    this.createProductFormSubscription?.unsubscribe();
  }

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly productService: ProductService,
    private readonly paymentService: PaymentService,
    private readonly customerService: CustomerService,
    private readonly employeeService: EmployeeService,
    private readonly productCategoryService: ProductCategoryService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly dialog: MatDialog
  ) { super(); }

  ngOnInit(): void {
    this.initForms();
    this.handleRouteParams();
    this.listenProductFormChanges();
  }

  private initForms(): void {
    this.initiateInvoiceForm();
    this.initiatePaymentForm();
    this.initiateProductForm();
    this.initiateCreateProductForm();
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



  initiateInvoiceForm(invoice: Invoice | null = null): void {
    this.invForm = this.fb.group({
      id: [invoice?.id],
      invoiceDate: [invoice?.invoiceDate, Validators.required],
      invoiceStatus: [invoice?.invoiceStatus, Validators.required],

      customerId: [invoice?.customer?.id],
      customerName: [invoice?.customer?.name, Validators.required],
      customerMobile: [invoice?.customer?.mobile, Validators.required],
      customerEmail: [invoice?.customer?.email],
      customerAddressLine: [invoice?.customer?.address],
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
      productDescription: [product?.description],
      productUnitRate: [product?.unitPrice, Validators.required],
      productDiscountPercent: [product?.discountPercent, [Validators.required, Validators.min(0), Validators.max(100)]],
      productQuantity: [product?.availableQuantity, [Validators.required, Validators.min(1)]],
      productAmount: [0]
    });

    this.listenProductFormChanges();
  }

  private listenProductFormChanges(): void {
    // Unsubscribe from previous listeners if they exist
    this.productFormSubscription?.unsubscribe();
    // Combine all three fields into one subscription
    this.productFormSubscription = combineLatest([
      this.productForm.get('productUnitRate')!.valueChanges.pipe(startWith(0)),
      this.productForm.get('productQuantity')!.valueChanges.pipe(startWith(0)),
      this.productForm.get('productDiscountPercent')!.valueChanges.pipe(startWith(0))
    ]).subscribe(() => this.calculateProductAmount());
  }

  createNewCustomer() {
    this.invForm.patchValue({
      customerId: '',
      customerName: '',
      customerMobile: '',
      customerEmail: '',
      customerAddressLine: '',
      customerPostcode: ''
    });
  }

  saveCustomer(): void {
    const orgId = this.invoice?.ownerOrganization?.id;
    if (!orgId) return;

    const customerData = {
      name: this.invForm.get('customerName')?.value,
      mobile: this.invForm.get('customerMobile')?.value,
      email: this.invForm.get('customerEmail')?.value,
      address: this.invForm.get('customerAddressLine')?.value,
      postcode: this.invForm.get('customerPostcode')?.value
    };

    if (!customerData.name || !customerData.mobile) {
      this.invoiceService.showToastInfoKey('INVOICE.TOAST.CUSTOMER_NAME_REQUIRED');
      return;
    }

    const customerId = this.invForm.get('customerId')?.value;

    const assignCustomerToInvoice = (customer: Customer) => {
      this.onSelectCustomer(customer);
      const invoiceUpdate = { ...this.invForm.value, customerId: customer.id };
      this.invoiceService.updateInvoice(this.invoiceId, invoiceUpdate).subscribe({
        next: (updated) => {
          this.invoice = updated;
          this.initiateInvoiceForm(updated);
          this.customerService.showToastSuccessKey(
            customerId ? 'INVOICE.TOAST.CUSTOMER_UPDATED_ASSIGNED' : 'INVOICE.TOAST.CUSTOMER_CREATED_ASSIGNED'
          );
        },
        error: (err) => this.invoiceService.showToastErrorResponse(err)
      });
    };

    if (customerId) {
      this.customerService.editCustomer(orgId, customerId, customerData).subscribe({
        next: (customer) => assignCustomerToInvoice(customer),
        error: (err) => this.customerService.showToastErrorResponse(err)
      });
    } else {
      this.customerService.createCustomer(orgId, customerData).subscribe({
        next: (customer) => assignCustomerToInvoice(customer),
        error: (err) => this.customerService.showToastErrorResponse(err)
      });
    }
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
      this.invoiceService.showToastInfoKey('INVOICE.TOAST.TYPE_4_CHARS');
      return;
    }
    this.fetchCustomer(searchKey);
  }

  fetchCustomer(searchKey: string) {
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
    const discountPercent = +this.productForm.get("productDiscountPercent")?.value || 0;
    const discount = (rate * quantity * discountPercent) / 100.0;
    const price = rate * quantity;
    this.productForm.patchValue({ productAmount: price - discount }, { emitEvent: false });
  }

  onSearchKeyType(event: Event): void {
    const searchKey = (event.target as HTMLInputElement).value;
    if (searchKey.length < 3) {
      this.invoiceService.showToastInfoKey('INVOICE.TOAST.TYPE_3_CHARS');
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
      next: (apiRes) => {
        this.refreshInvoice();
      },
      error: (err) => {
        this.refreshInvoice();
        this.productService.showToastErrorResponse(err);
      }
    });

  }

  deletePayment(payment: Payment): void {
    const dialogRef = this.dialog.open(ReasonModalComponent, {
      width: '400px',
      data: { message: `Are you sure you want to delete this payment of ${payment.amount}?` }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.confirmed) {
        this.paymentService.deletePayment(this.invoiceId, payment.id, result.reason).subscribe({
          next: () => {
            this.refreshInvoice();
            this.paymentService.showToastSuccessKey('INVOICE.TOAST.PAYMENT_DELETED');
          },
          error: (errorRes) => {
            this.refreshInvoice();
            this.paymentService.showToastErrorResponse(errorRes);
          }
        });
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
        this.paymentService.showToastSuccessKey('INVOICE.TOAST.PAYMENT_ADDED');
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
        this.invoiceService.showToastSuccessKey('INVOICE.TOAST.INVOICE_UPDATED');
      },
      error: (err) => {
        this.refreshInvoice();
        this.invoiceService.showToastErrorResponse(err)
      }
    });
  }

  markAsPaid(): void {
    if (this.invoice && this.invoice.remainingAmount > 0) {
      this.dialog.open(ConfirmationModalComponent, {
        width: '400px',
        data: { message: `Full payment not received yet. Remaining amount: ${this.invoice.remainingAmount.toFixed(2)} BDT. Please collect the full payment before marking as paid.` }
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '400px',
      data: { message: 'Are you sure you want to mark this invoice as PAID? Once marked as paid, you will not be able to modify this invoice.' }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        const invoice = { ...this.invForm.value, invoiceStatus: 'PAID' };
        this.invoiceService.updateInvoice(this.invoiceId, invoice).subscribe({
          next: updated => {
            this.invoice = updated;
            this.initiateInvoiceForm(updated);
            this.invoiceService.showToastSuccessKey('INVOICE.TOAST.MARKED_PAID');
          },
          error: (err) => {
            this.refreshInvoice();
            this.invoiceService.showToastErrorResponse(err);
          }
        });
      }
    });
  }

  previewInvoice() {
    this.router.navigate(['/invoice/detail'], { queryParams: { orgId: this.orgId, invoiceId: this.invoiceId } });
  }

  backToInvoiceList() {
    this.router.navigate(['/invoice/list']);
  }

  downloadInvoice() {
    this.invoiceService.downloadInvoice(this.orgId, this.invoiceId).subscribe({
      next: (pdfRes: Blob) => this.handleBlobDownload(pdfRes),
      error: (err) => this.invoiceService.showToastErrorResponse(err),
    });
  }

  downloadReceipt() {
    this.invoiceService.downloadInvoiceReceipt(this.orgId, this.invoiceId).subscribe({
      next: (pdfRes: Blob) => this.handleBlobDownload(pdfRes),
      error: (err) => this.invoiceService.showToastErrorResponse(err),
    });
  }

  private handleBlobDownload(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.invoice?.invoiceNumber || this.invoice?.id}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    this.invoiceService.showToastSuccessKey('TOAST.DOWNLOADED_SUCCESSFULLY');
  }

  // --- Create New Product Mode ---

  initiateCreateProductForm(): void {
    this.createProductForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(70)]],
      code: [generateRandomLuhnCode(6), Validators.required],
      description: [''],
      unitType: ['', Validators.required],
      employeeId: ['', Validators.required],
      categoryId: ['', Validators.required],
      initialQuantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(1)]],
      perUnitProductionCost: [0],
      perUnitEmployeeCost: [0],
      discountPercent: [0, [Validators.min(0), Validators.max(100)]],
      sellingUnitRate: [0, [Validators.required, Validators.min(1)]],
      quantityToSell: [1, [Validators.required, Validators.min(1)]],
      saleDiscountPercent: [0, [Validators.min(0), Validators.max(100)]],
      saleAmount: [{ value: 0, disabled: true }]
    });

    this.listenCreateProductFormChanges();
  }

  private listenCreateProductFormChanges(): void {
    this.createProductFormSubscription?.unsubscribe();
    this.createProductFormSubscription = combineLatest([
      this.createProductForm.get('sellingUnitRate')!.valueChanges.pipe(startWith(0)),
      this.createProductForm.get('quantityToSell')!.valueChanges.pipe(startWith(0)),
      this.createProductForm.get('saleDiscountPercent')!.valueChanges.pipe(startWith(0))
    ]).subscribe(() => this.calculateCreateProductSaleAmount());
  }

  private calculateCreateProductSaleAmount(): void {
    const rate = +this.createProductForm.get('sellingUnitRate')?.value || 0;
    const qty = +this.createProductForm.get('quantityToSell')?.value || 0;
    const discPct = +this.createProductForm.get('saleDiscountPercent')?.value || 0;
    const discount = (rate * qty * discPct) / 100.0;
    const amount = rate * qty - discount;
    this.createProductForm.get('saleAmount')?.setValue(amount, { emitEvent: false });
  }

  toggleCreateProductMode(): void {
    this.isCreatingNewProduct = !this.isCreatingNewProduct;
    if (this.isCreatingNewProduct) {
      this.initiateCreateProductForm();
      this.loadProductUnitTypes();
      this.loadProductCategories();
    } else {
      this.initiateProductForm();
    }
  }

  generateProductCode(): void {
    this.createProductForm.patchValue({ code: generateRandomLuhnCode(6) });
  }

  loadProductUnitTypes(): void {
    if (this.unitTypes.length > 0) return;
    this.productService.getProductUnitTypes().subscribe({
      next: types => this.unitTypes = types,
      error: err => this.productService.showToastErrorResponse(err)
    });
  }

  loadProductCategories(): void {
    const orgId = this.invoice?.ownerOrganization?.id;
    if (!orgId) return;
    this.productCategoryService.getProductCagegoriesByOrganization(orgId).subscribe({
      next: categories => this.allProductCategories = categories,
      error: err => this.productCategoryService.showToastErrorResponse(err)
    });
  }

  onSearchEmployeeKeyType(event: Event): void {
    const searchKey = (event.target as HTMLInputElement).value;
    if (searchKey.length < 3) {
      this.invoiceService.showToastInfoKey('INVOICE.TOAST.TYPE_3_CHARS');
      return;
    }
    const orgId = this.invoice?.ownerOrganization?.id;
    if (!orgId) return;
    this.employeeService.getEmployeesByOrganization(orgId, 0, 20, searchKey).subscribe({
      next: page => {
        this.allEmployees = page.content.map(e => ({
          ...e,
          label: `${e.fullName} - ${e.mobileNo}`
        } as any));
      },
      error: err => console.error(err)
    });
  }

  onSelectEmployee(employee: Employee): void {
    if (!employee) return;
    if (employee.employeeBillingType === 'DAILY') {
      const rate = employee.billingRate || 0;
      this.createProductForm.patchValue({
        perUnitEmployeeCost: rate,
        perUnitProductionCost: 0,
        unitPrice: Math.round(rate * 1.5),
        sellingUnitRate: Math.round(rate * 1.5)
      });
    }
  }

  addNewCategory = (name: string): void => {
    const orgId = this.invoice?.ownerOrganization?.id;
    if (!orgId) return;
    const newCategory: ProductCategory = { id: null, name, description: '', active: true };
    this.productCategoryService.addProductCategoryByOrganization(orgId, newCategory).subscribe({
      next: created => {
        this.allProductCategories = [...this.allProductCategories, created];
        this.createProductForm.patchValue({ categoryId: created.id });
        this.productCategoryService.showToastSuccessKey('INVOICE.TOAST.CATEGORY_CREATED');
      },
      error: err => this.productCategoryService.showToastErrorResponse(err)
    });
  }

  submitNewProduct(): void {
    if (this.createProductForm.invalid) return;
    const v = this.createProductForm.getRawValue();
    const request: CreateAndAddProductRequest = {
      name: v.name,
      code: v.code,
      description: v.description,
      unitType: v.unitType,
      employeeId: v.employeeId,
      categoryId: v.categoryId,
      initialQuantity: v.initialQuantity,
      unitPrice: v.unitPrice,
      perUnitProductionCost: v.perUnitProductionCost,
      perUnitEmployeeCost: v.perUnitEmployeeCost,
      discountPercent: v.discountPercent,
      sellingUnitRate: v.sellingUnitRate,
      quantityToSell: v.quantityToSell,
      saleDiscountPercent: v.saleDiscountPercent
    };

    this.invoiceService.createAndAddProduct(this.invoiceId, request).subscribe({
      next: () => {
        this.invoiceService.showToastSuccessKey('INVOICE.TOAST.PRODUCT_CREATED_ADDED');
        this.isCreatingNewProduct = false;
        this.initiateCreateProductForm();
        this.initiateProductForm();
        this.refreshInvoice();
      },
      error: err => this.invoiceService.showToastErrorResponse(err)
    });
  }

}
