
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { trigger, style, transition, animate } from '@angular/animations';
import { DrawerConfig, DrawerService } from 'src/app/core/services/drawer.service';
import { AccountingService } from 'src/app/core/services/accounting.service';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-cashout-type-drawer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cashout-type-drawer.component.html',
  styleUrls: ['./cashout-type-drawer.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class CashoutTypeDrawerComponent extends FormError implements OnInit, OnDestroy {
  isOpen = false;
  config: DrawerConfig | null = null;
  form: FormGroup;
  private subscription?: Subscription;

  // Form state
  isSubmitting = false;
  showSuccessMessage = false;

  constructor(
    private drawerService: DrawerService,
    private fb: FormBuilder,
    private accService: AccountingService
  ) {
    super();
    this.form = this.createForm();

  }

  ngOnInit(): void {
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
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      active: [true],
    });
  }

  resetForm(): void {
    this.form.reset({
      active: true
    });
    this.isSubmitting = false;
    this.showSuccessMessage = false;
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      this.accService.addCashOutType(this.form.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
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