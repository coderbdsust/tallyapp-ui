import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DrawerInterface, DrawerOptions, InstanceOptions, Drawer } from 'flowbite';
import { Organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FileUploadResponse } from 'src/app/core/models/file-upload-response.model';

@Component({
  selector: 'app-add-organization',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    WordPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-organization.component.html',
  styleUrl: './add-organization.component.scss',
})
export class AddOrganizationComponent implements OnInit {
  // ── Native file input refs (no child component needed) ────────────────
  @ViewChild('bannerInput') bannerInput!: ElementRef<HTMLInputElement>;
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;
  @ViewChild('logoInput')   logoInput!: ElementRef<HTMLInputElement>;

  @Output() public orgEmitter = new EventEmitter<Organization>();

  // ── Drawer ────────────────────────────────────────────────────────────
  private $drawerEl: HTMLElement | null = null;
  drawer: DrawerInterface | undefined;

  orgDrawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => { /* state is reset on next openDrawer() */ }
  };

  orgDrawerInstanceOptions: InstanceOptions = {
    id: 'drawer-organization',
    override: true,
  };

  // ── Form ──────────────────────────────────────────────────────────────
  orgForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  status: string[] = ['ACTIVE', 'INACTIVE', 'CLOSED'];

  // ── Image state ───────────────────────────────────────────────────────
  bannerPreviewUrl: string | null = null;
  avatarPreviewUrl: string | null = null;
  logoPreviewUrl:   string | null = null;

  selectedBanner: File | null = null;
  selectedAvatar: File | null = null;
  selectedLogo:   File | null = null;

  existingBannerId: string | null = null;
  existingAvatarId: string | null = null;
  existingLogoId:   string | null = null;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private orgService: OrganizationService,
    private fileUploaderService: FileUploaderService,
  ) { }

  ngOnInit(): void {
    this.$drawerEl = document.getElementById('drawer-organization') as HTMLElement;
    this.$drawerEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$drawerEl, this.orgDrawerOptions, this.orgDrawerInstanceOptions);
    this.drawer.hide();
    this.buildForm();
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  get f() { return this.orgForm.controls; }

  private buildForm(org: Organization | null = null) {
    this.orgForm = this._formBuilder.group({
      id:                 [org?.id ?? null],
      orgName:            [org?.orgName ?? '',         Validators.required],
      orgRegNumber:       [org?.orgRegNumber ?? '',     Validators.required],
      orgTinNumber:       [org?.orgTinNumber ?? '',     Validators.required],
      orgVatNumber:       [org?.orgVatNumber ?? '',     Validators.required],
      orgOpenAt:          [org?.orgOpenAt ?? ''],
      orgOpenInWeek:      [org?.orgOpenInWeek ?? ''],
      orgOpeningTitle:    [org?.orgOpeningTitle ?? ''],
      owner:              [org?.owner ?? '',            Validators.required],
      orgEmail:           [org?.orgEmail ?? '',         [Validators.required, Validators.email]],
      orgMobileNo:        [org?.orgMobileNo ?? '',      [
                            Validators.required,
                            Validators.pattern(/^01[3-9]\d{8}$/),
                            Validators.minLength(11),
                            Validators.maxLength(11),
                          ]],
      since:              [org?.since ?? '',            Validators.required],
      ownerImage:         [org?.ownerImage ?? null],
      bannerImage:        [org?.bannerImage ?? null],
      logoImage:          [org?.logoImage ?? null],
      orgAddressLine:     [org?.orgAddressLine ?? '',   Validators.required],
      orgAddressCity:     [org?.orgAddressCity ?? '',   Validators.required],
      orgAddressPostcode: [org?.orgAddressPostcode ?? '', Validators.required],
      orgAddressCountry:  [org?.orgAddressCountry ?? '', Validators.required],
      status:             [org?.status ?? '',           Validators.required],
      vat:                [org?.vat ?? '',              Validators.required],
      tax:                [org?.tax ?? '',              Validators.required],
    });
  }

  private resetImageState() {
    this.bannerPreviewUrl = null;
    this.avatarPreviewUrl = null;
    this.logoPreviewUrl   = null;
    this.selectedBanner   = null;
    this.selectedAvatar   = null;
    this.selectedLogo     = null;
    this.existingBannerId = null;
    this.existingAvatarId = null;
    this.existingLogoId   = null;
    [this.bannerInput, this.avatarInput, this.logoInput].forEach(ref => {
      if (ref?.nativeElement) ref.nativeElement.value = '';
    });
  }

  private deleteFromServer(fileId: string | null) {
    if (fileId) {
      this.fileUploaderService.deleteFileById(fileId).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
  }

  private handleFileChange(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return null;
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) return null;
    return file;
  }

  // ── Drawer open / close ───────────────────────────────────────────────

  openDrawer(org: Organization | null = null) {
    this.submitted    = false;
    this.errorMessage = '';
    this.resetImageState();
    this.buildForm(org);

    if (org?.bannerImage) {
      this.bannerPreviewUrl = org.bannerImage.url;
      this.existingBannerId = org.bannerImage.id ?? null;
    }
    if (org?.ownerImage) {
      this.avatarPreviewUrl = org.ownerImage.url;
      this.existingAvatarId = org.ownerImage.id ?? null;
    }
    if (org?.logoImage) {
      this.logoPreviewUrl = org.logoImage.url;
      this.existingLogoId = org.logoImage.id ?? null;
    }

    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted    = false;
    this.errorMessage = '';
  }

  // ── Banner handlers ───────────────────────────────────────────────────

  onBannerFileChange(event: Event) {
    const file = this.handleFileChange(event);
    if (!file) return;
    this.selectedBanner   = file;
    this.bannerPreviewUrl = URL.createObjectURL(file);
    this.orgForm.patchValue({ bannerImage: file });
  }

  onRemoveBanner() {
    this.deleteFromServer(this.existingBannerId);
    this.bannerPreviewUrl = null;
    this.selectedBanner   = null;
    this.existingBannerId = null;
    if (this.bannerInput?.nativeElement) this.bannerInput.nativeElement.value = '';
    this.orgForm.patchValue({ bannerImage: null });
  }

  // ── Avatar handlers ───────────────────────────────────────────────────

  onAvatarFileChange(event: Event) {
    const file = this.handleFileChange(event);
    if (!file) return;
    this.selectedAvatar   = file;
    this.avatarPreviewUrl = URL.createObjectURL(file);
    this.orgForm.patchValue({ ownerImage: file });
  }

  onRemoveAvatar() {
    this.deleteFromServer(this.existingAvatarId);
    this.avatarPreviewUrl = null;
    this.selectedAvatar   = null;
    this.existingAvatarId = null;
    if (this.avatarInput?.nativeElement) this.avatarInput.nativeElement.value = '';
    this.orgForm.patchValue({ ownerImage: null });
  }

  // ── Logo handlers ─────────────────────────────────────────────────────

  onLogoFileChange(event: Event) {
    const file = this.handleFileChange(event);
    if (!file) return;
    this.selectedLogo   = file;
    this.logoPreviewUrl = URL.createObjectURL(file);
    this.orgForm.patchValue({ logoImage: file });
  }

  onRemoveLogo() {
    this.deleteFromServer(this.existingLogoId);
    this.logoPreviewUrl = null;
    this.selectedLogo   = null;
    this.existingLogoId = null;
    if (this.logoInput?.nativeElement) this.logoInput.nativeElement.value = '';
    this.orgForm.patchValue({ logoImage: null });
  }

  // ── Submit ────────────────────────────────────────────────────────────

  onAddOrganization() {
    this.submitted = true;

    if (this.orgForm.invalid) {
      return;
    }

    const organizationData = { ...this.orgForm.value };
    const uploads = [];

    if (this.selectedLogo) {
      uploads.push(
        this.fileUploaderService.storeFile(this.selectedLogo).pipe(
          map((response: FileUploadResponse) => ({ field: 'logoImage', value: response })),
          catchError((error) => {
            this.orgService.showToastErrorResponse(error);
            return throwError(() => error);
          })
        )
      );
    }

    if (this.selectedAvatar) {
      uploads.push(
        this.fileUploaderService.storeFile(this.selectedAvatar).pipe(
          map((response: FileUploadResponse) => ({ field: 'ownerImage', value: response })),
          catchError((error) => {
            this.orgService.showToastErrorResponse(error);
            return throwError(() => error);
          })
        )
      );
    }

    if (this.selectedBanner) {
      uploads.push(
        this.fileUploaderService.storeFile(this.selectedBanner).pipe(
          map((response: FileUploadResponse) => ({ field: 'bannerImage', value: response })),
          catchError((error) => {
            this.orgService.showToastErrorResponse(error);
            return throwError(() => error);
          })
        )
      );
    }

    const uploadObservable = uploads.length > 0 ? forkJoin(uploads) : of([]);

    uploadObservable
      .pipe(
        switchMap((uploadResults) => {
          uploadResults.forEach((result: any) => {
            if (result && result.field && result.value) {
              organizationData[result.field] = result.value;
            }
          });

          return this.orgService.addOrganization(organizationData);
        })
      )
      .subscribe({
        next: (org) => {
          this.orgEmitter.emit(org);
          this.orgForm.patchValue({ id: org.id });
          this.orgService.syncOrganization(org);
          this.orgService.showToastSuccess('Organization saved successfully');
          this.closeDrawer();
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        },
      });
  }
}