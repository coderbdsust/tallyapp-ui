import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, style, transition, animate } from '@angular/animations';
import { DrawerConfig, DrawerService } from 'src/app/core/services/drawer.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { CashtypeService } from 'src/app/core/services/cashtype.service';
import { Organization } from 'src/app/core/models/organization.model';
import { OrganizationService } from 'src/app/core/services/organization.service';
import { CashTypeName } from 'src/app/core/models/cashtype.model';

@Component({
  selector: 'app-expense-type-drawer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './expense-type-drawer.component.html',
  styleUrl: './expense-type-drawer.component.scss',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('100ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('100ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('100ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ExpenseTypeDrawerComponent   extends FormError implements OnInit, OnDestroy {
    isOpen = false;
    config: DrawerConfig | null = null;
    form: FormGroup;
    private subscription?: Subscription;
    private organization!: Organization;
  
    // Form state
    isSubmitting = false;
    showSuccessMessage = false;
  
    constructor(
      private drawerService: DrawerService,
      private fb: FormBuilder,
      private cashTypeService: CashtypeService,
      private orgService: OrganizationService
    ) {
      super();
      this.form = this.createForm();
  
    }
  
    ngOnInit(): void {
      this.orgService.organization$.subscribe((org) => {
        if (org) {
          this.organization = org;
        }
      });
      
      this.subscription = this.drawerService.drawerState$.subscribe(state => {
        this.isOpen = state.isOpen;
        this.config = state.config;
  
        if (this.isOpen) {
          this.resetForm();
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }
  
    ngOnDestroy(): void {
      this.subscription?.unsubscribe();
      document.body.style.overflow = '';
    }
  
    createForm(): FormGroup {
      return this.fb.group({
        id: [''],
        displayName: ['', [Validators.required, Validators.minLength(2)]],
        description: ['', [Validators.required, Validators.maxLength(500)]],
        cashType: [CashTypeName.EMPLOYEE_EXPENSE_TYPE],
        active: [true],
      });
    }
  
    resetForm(): void {
      this.form.reset({
        cashType:CashTypeName.EMPLOYEE_EXPENSE_TYPE,
        active: true
      });
      this.isSubmitting = false;
      this.showSuccessMessage = false;
    }
  
    async onSubmit(): Promise<void> {
      if (this.form.valid && !this.isSubmitting) {
        this.isSubmitting = true;
  
        this.cashTypeService.createCashType(this.organization.id, this.form.value).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.close();
          },
          error: (error) => {
            this.isSubmitting = false;
            this.close();
            this.cashTypeService.showToastErrorResponse(error);
          }
        });
      }
    }
  
    close(): void {
      if (this.config?.onClose) {
        this.config.onClose();
      }
      this.drawerService.close();
    }
  
    onBackdropClick(event: MouseEvent): void {
      if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) {
        this.close();
      }
    }

}
