import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { ConfirmationModalComponent } from 'src/app/common/components/confirmation-modal/confirmation-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { formatCurrency } from 'src/app/common/utils/common';
import { PurchaseOrder, PurchaseOrderPayment } from '../../supplier.model';
import { PurchaseOrderService } from 'src/app/core/services/purchase-order.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-purchase-order-detail',
  imports: [AngularSvgIconModule, CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, WordPipe],
  templateUrl: './purchase-order-detail.component.html',
  styleUrl: './purchase-order-detail.component.scss'
})
export class PurchaseOrderDetailComponent extends FormError implements OnInit, OnDestroy {
  po: PurchaseOrder | null = null;
  loading = true;
  showPaymentForm = false;
  paymentForm!: FormGroup;
  paymentSubmitted = false;
  formatCurrency = formatCurrency;

  private orgId: string = '';
  private poId: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private poService: PurchaseOrderService,
    public dialog: MatDialog
  ) {super();}

  ngOnInit(): void {
    this.initPaymentForm();
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orgId = params['orgId'];
        this.poId = params['poId'];

        if (!this.orgId || !this.poId) {
          this.router.navigate(['/supplier/purchase-order']);
          return;
        }
        this.loadPurchaseOrder();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPurchaseOrder(): void {
    this.loading = true;
    this.poService.getPurchaseOrderById(this.orgId, this.poId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (po) => {
          this.po = po;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.poService.showToastErrorResponse(err);
          this.router.navigate(['/supplier/purchase-order']);
        },
      });
  }

  private initPaymentForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.paymentForm = this.fb.group({
      paymentAmount: ['', [Validators.required, Validators.min(0.01)]],
      paymentDate: [today, Validators.required],
      paymentMethod: ['', Validators.required],
      paymentRef: [''],
    });
  }

  get pf() {
    return this.paymentForm.controls;
  }

  // Status checks
  get isDraft(): boolean { return this.po?.status === 'DRAFT'; }
  get isApproved(): boolean { return this.po?.status === 'APPROVED'; }
  get isPartiallyPaid(): boolean { return this.po?.status === 'PARTIALLY_PAID'; }
  get isPaid(): boolean { return this.po?.status === 'PAID'; }
  get isCancelled(): boolean { return this.po?.status === 'CANCELLED'; }
  get canAddPayment(): boolean { return this.isApproved || this.isPartiallyPaid; }
  get hasPayments(): boolean { return (this.po?.payments?.length ?? 0) > 0; }

  // Actions
  editPurchaseOrder(): void {
    this.router.navigate(['/supplier/purchase-order/create'], {
      queryParams: { orgId: this.orgId, poId: this.poId }
    });
  }

  approvePurchaseOrder(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to approve ${this.po?.poNumber}? This will create accounting entries.` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.poService.approvePurchaseOrder(this.orgId, this.poId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (po) => {
              this.po = po;
              this.poService.showToastSuccess('Purchase order approved successfully');
            },
            error: (err) => {
              this.poService.showToastErrorResponse(err);
            },
          });
      }
    });
  }

  cancelPurchaseOrder(): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to cancel ${this.po?.poNumber}? All payments must be deleted first.` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.poService.cancelPurchaseOrder(this.orgId, this.poId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.poService.showToastSuccess('Purchase order cancelled successfully');
              this.loadPurchaseOrder();
            },
            error: (err) => {
              this.poService.showToastErrorResponse(err);
            },
          });
      }
    });
  }

  togglePaymentForm(): void {
    this.showPaymentForm = !this.showPaymentForm;
    if (this.showPaymentForm) {
      this.initPaymentForm();
      this.paymentSubmitted = false;
    }
  }

  submitPayment(): void {
    this.paymentSubmitted = true;
    if (this.paymentForm.invalid) return;

    const paymentData = this.paymentForm.value;
    this.poService.addPayment(this.orgId, this.poId, paymentData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.poService.showToastSuccess('Payment added successfully');
          this.showPaymentForm = false;
          this.paymentSubmitted = false;
          this.loadPurchaseOrder();
        },
        error: (err) => {
          this.poService.showToastErrorResponse(err);
        },
      });
  }

  deletePayment(payment: PurchaseOrderPayment): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '350px',
      data: { message: `Are you sure you want to delete payment of ${formatCurrency(payment.amount)}?` },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.poService.deletePayment(this.orgId, this.poId, payment.id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.poService.showToastSuccess('Payment deleted successfully');
              this.loadPurchaseOrder();
            },
            error: (err) => {
              this.poService.showToastErrorResponse(err);
            },
          });
      }
    });
  }

  getStatusColor(status: string): { bg: string; text: string } {
    const statusMap: Record<string, { bg: string; text: string }> = {
      'DRAFT': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'APPROVED': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
      'PARTIALLY_PAID': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'PAID': { bg: 'bg-green-100', text: 'text-green-800' },
      'CANCELLED': { bg: 'bg-red-100', text: 'text-red-800' },
    };
    return statusMap[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  }

  goBack(): void {
    this.router.navigate(['/supplier/purchase-order']);
  }
}
