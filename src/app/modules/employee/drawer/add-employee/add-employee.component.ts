import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Organization } from '../../../../core/models/organization.model';
import { Drawer, DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { OrganizationService } from '../../../../core/services/organization.service';
import { Employee } from '../../../../core/models/employee.model';
import { EmployeeService } from '../../../../core/services/employee.service';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { FormError } from 'src/app/common/components/form-error/form-error.component';
import { FileUploadResponse } from 'src/app/core/models/file-upload-response.model';

@Component({
  selector: 'app-add-employee',
  imports: [AngularSvgIconModule, FormsModule, ReactiveFormsModule, CommonModule, WordPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss'
})
export class AddEmployeeComponent extends FormError implements OnInit {
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  @Output() public employeeEmitter = new EventEmitter<Employee>();
  @Input() organization!: Organization;

  // ── Drawer ────────────────────────────────────────────────────────────
  private $drawerEl: HTMLElement | null = null;
  drawer: DrawerInterface | undefined;

  empDrawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => {
      // Nothing special needed — form resets on next openDrawer() call
    }
  };

  empDrawerInstanceOptions: InstanceOptions = {
    id: 'drawer-employee',
    override: true,
  };

  // ── Form ──────────────────────────────────────────────────────────────
  empForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  // ── Dropdown lists ────────────────────────────────────────────────────
  empBillingTypeList: String[] = [];
  empStatusList: String[] = [];
  empTypeList: String[] = [];

  // ── Avatar state (inline — no child component) ────────────────────────
  avatarPreviewUrl: string | null = null;   // shown in <img>
  selectedFile: File | null = null;          // file to upload on submit
  existingFileId: string | null = null;      // id of already-uploaded file (for deletion)

  constructor(
    private readonly _formBuilder: FormBuilder,
    private orgService: OrganizationService,
    private empService: EmployeeService,
    private fileUploaderService: FileUploaderService
  ) { super(); }

  ngOnInit(): void {
    this.$drawerEl = document.getElementById('drawer-employee') as HTMLElement;
    this.$drawerEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$drawerEl, this.empDrawerOptions, this.empDrawerInstanceOptions);
    this.drawer.hide();
    this.buildForm();
    this.loadDropdowns();
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  get f() { return this.empForm.controls; }

  private buildForm(employee: Employee | null = null) {
    this.empForm = this._formBuilder.group({
      id:                   [employee?.id ?? null],
      orgId:                [this.organization?.id],
      orgName:              [this.organization?.orgName],
      fullName:             [employee?.fullName ?? '', Validators.required],
      profileImage:         [employee?.profileImage ?? null],
      dateOfBirth:          [employee?.dateOfBirth ?? '', Validators.required],
      joiningDate:          [employee?.joiningDate ?? '', Validators.required],
      mobileNo:             [employee?.mobileNo ?? '', [
                              Validators.required,
                              Validators.pattern(/^01[3-9]\d{8}$/),
                              Validators.minLength(11),
                              Validators.maxLength(11),
                            ]],
      empAddressLine:       [employee?.empAddressLine ?? '', Validators.required],
      empCity:              [employee?.empCity ?? '',        Validators.required],
      empPostcode:          [employee?.empPostcode ?? '',    Validators.required],
      empCountry:           [employee?.empCountry ?? '',     Validators.required],
      status:               [employee?.status ?? '',         [Validators.required, Validators.minLength(3)]],
      employeeBillingType:  [employee?.employeeBillingType ?? '', [Validators.required, Validators.minLength(3)]],
      employeeType:         [employee?.employeeType ?? '',   [Validators.required, Validators.minLength(3)]],
      billingRate:          [employee?.billingRate ?? '',    Validators.required],
      dailyAllowance:       [employee?.dailyAllowance ?? '', Validators.required],
    });
  }

  private resetAvatarState() {
    this.avatarPreviewUrl = null;
    this.selectedFile = null;
    this.existingFileId = null;
    if (this.avatarInput?.nativeElement) {
      this.avatarInput.nativeElement.value = '';
    }
  }

  private loadDropdowns() {
    this.empService.getEmployeeStatus().subscribe({
      next: r => this.empStatusList = r,
      error: e => console.error(e),
    });
    this.empService.getEmployeeTypes().subscribe({
      next: r => this.empTypeList = r,
      error: e => console.error(e),
    });
    this.empService.getEmployeeBillingTypes().subscribe({
      next: r => this.empBillingTypeList = r,
      error: e => console.error(e),
    });
  }

  // ── Drawer open / close ───────────────────────────────────────────────

  openDrawer(employee: Employee | null = null) {
    this.submitted = false;
    this.errorMessage = '';
    this.resetAvatarState();
    this.buildForm(employee);

    // Restore existing avatar if editing
    if (employee?.profileImage) {
      this.avatarPreviewUrl = employee.profileImage.url;
      this.existingFileId   = employee.profileImage.id ?? null;
    }

    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted = false;
    this.errorMessage = '';
  }

  // ── Avatar handlers (inline) ──────────────────────────────────────────

  onAvatarFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];

    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) return;

    this.selectedFile    = file;
    this.avatarPreviewUrl = URL.createObjectURL(file);
    this.empForm.patchValue({ profileImage: file });
  }

  onRemoveAvatar() {
    // Delete from server if it was already uploaded
    if (this.existingFileId) {
      this.fileUploaderService.deleteFileById(this.existingFileId).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    this.resetAvatarState();
    this.empForm.patchValue({ profileImage: null });
  }

  // ── Submit ────────────────────────────────────────────────────────────

  onEmployeeSubmit() {
    this.submitted = true;
    if (this.empForm.invalid) return;

    const employeeData = { ...this.empForm.value };
    const orgId        = this.organization.id;

    // Upload new avatar first (if selected), otherwise skip
    const upload$: Observable<FileUploadResponse | null> = this.selectedFile
      ? this.fileUploaderService.storeFile(this.selectedFile).pipe(
          tap((res: FileUploadResponse) => { employeeData.profileImage = res; }),
          catchError(err => {
            this.orgService.showToastErrorResponse(err);
            return throwError(() => err);
          })
        )
      : of(null);

    upload$.pipe(
      switchMap(() => {
        employeeData.orgId = orgId;
        return this.empService.addEmployeeToOrganization(orgId, employeeData as Employee);
      })
    ).subscribe({
      next: (employee) => {
        this.employeeEmitter.emit(employee);
        this.empService.showToastSuccess('Employee saved successfully');
        this.closeDrawer();
      },
      error: (err) => {
        this.orgService.showToastErrorResponse(err);
      },
    });
  }
}