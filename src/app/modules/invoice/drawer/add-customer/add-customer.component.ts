import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerInterface, DrawerOptions, InstanceOptions, Drawer } from 'flowbite';
import { Subject, takeUntil } from 'rxjs';
import { Customer } from '../../invoice.model';
import { CustomerService } from 'src/app/core/services/customer.service';

@Component({
  selector: 'app-add-customer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AngularSvgIconModule, TranslateModule],
  templateUrl: './add-customer.component.html',
  styleUrl: './add-customer.component.scss',
})
export class AddCustomerComponent implements OnInit, OnDestroy {
  @Input() orgId: string | null = null;
  @Input() paymentOnInvoice = true;
  @Output() customerSaved = new EventEmitter<Customer>();

  // ── Drawer ───────────────────────────────────────────────
  private $drawerEl: HTMLElement | null = null;
  drawer: DrawerInterface | undefined;

  drawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => {}
  };

  drawerInstanceOptions: InstanceOptions = {
    id: 'drawer-customer',
    override: true,
  };

  // ── Form ─────────────────────────────────────────────────
  customerForm!: FormGroup;
  submitted = false;
  isEditMode = false;
  existingCustomer: Customer | null = null;
  checkingCustomer = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
  ) {}

  ngOnInit(): void {
    this.$drawerEl = document.getElementById('drawer-customer') as HTMLElement;
    this.$drawerEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$drawerEl, this.drawerOptions, this.drawerInstanceOptions);
    this.drawer.hide();
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get f() { return this.customerForm.controls; }

  // ── Form init ────────────────────────────────────────────
  private initForm(customer: Customer | null = null): void {
    const formConfig: any = {
      id: [customer?.id || ''],
      name: [customer?.name || '', Validators.required],
      mobile: [customer?.mobile || '', [
        Validators.required,
        Validators.pattern(/^01[3-9]\d{8}$/),
        Validators.minLength(11),
        Validators.maxLength(11)
      ]],
      email: [customer?.email || ''],
      billingAddressLine: [customer?.billingAddressLine || ''],
      billingCity: [customer?.billingCity || ''],
      billingPostcode: [customer?.billingPostcode || ''],
      billingCountry: [customer?.billingCountry || ''],
      deliveryAddressLine: [customer?.deliveryAddressLine || ''],
      deliveryCity: [customer?.deliveryCity || ''],
      deliveryPostcode: [customer?.deliveryPostcode || ''],
      deliveryCountry: [customer?.deliveryCountry || '']
    };

    if (!this.paymentOnInvoice) {
      formConfig.openingDue = [customer?.openingDue ?? 0];
    }

    this.customerForm = this.fb.group(formConfig);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.customerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  // ── Drawer open / close ──────────────────────────────────
  openDrawer(customer: Customer | null = null): void {
    this.isEditMode = !!customer;
    this.submitted = false;
    this.existingCustomer = null;
    this.initForm(customer);
    this.drawer?.show();
  }

  closeDrawer(): void {
    this.drawer?.hide();
    this.submitted = false;
    this.existingCustomer = null;
  }

  // ── Check existing ───────────────────────────────────────
  checkExistingCustomer(): void {
    if (!this.orgId || this.isEditMode) return;

    const email = this.customerForm.get('email')?.value?.trim() || '';
    const mobile = this.customerForm.get('mobile')?.value?.trim() || '';

    if (!email && !mobile) {
      this.existingCustomer = null;
      return;
    }

    this.checkingCustomer = true;
    this.customerService
      .checkCustomerExists(this.orgId, email, mobile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.existingCustomer = customer ?? null;
          this.checkingCustomer = false;
        },
        error: () => {
          this.existingCustomer = null;
          this.checkingCustomer = false;
        }
      });
  }

  get isExistingBlock(): boolean {
    return !!this.existingCustomer && !this.isEditMode;
  }

  // ── Save ─────────────────────────────────────────────────
  saveCustomer(): void {
    this.submitted = true;
    if (this.customerForm.invalid || !this.orgId || this.isExistingBlock) return;

    const formData = this.customerForm.value;

    if (this.isEditMode && formData.id) {
      this.customerService
        .editCustomer(this.orgId, formData.id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updated) => {
            this.customerService.showToastSuccessKey('INVOICE.CUSTOMER_LIST.TOAST.UPDATED');
            this.closeDrawer();
            this.customerSaved.emit(updated ?? formData);
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    } else {
      this.customerService
        .createCustomer(this.orgId, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (created) => {
            this.customerService.showToastSuccessKey('INVOICE.CUSTOMER_LIST.TOAST.CREATED');
            this.closeDrawer();
            this.customerSaved.emit(created);
          },
          error: (err) => this.customerService.showToastErrorResponse(err)
        });
    }
  }
}
