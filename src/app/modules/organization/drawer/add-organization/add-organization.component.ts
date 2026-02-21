import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { Drawer } from 'flowbite';
import { Organization } from '../../../../core/models/organization.model';
import { OrganizationService } from '../../../../core/services/organization.service';
import { FileUploaderComponent } from 'src/app/common/components/file-uploader/file-uploader.component';
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
    ButtonComponent,
    FileUploaderComponent,
    WordPipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './add-organization.component.html',
  styleUrl: './add-organization.component.scss',
})
export class AddOrganizationComponent {
  @ViewChild("logoImage") logoUploader!: FileUploaderComponent;
  @ViewChild("avatarImage") avatarUploader!: FileUploaderComponent;
  @ViewChild("bannerImage") bannerUploader!: FileUploaderComponent;

  @Output() public orgEmitter = new EventEmitter<Organization>();
  organization!: Organization;
  $orgDrawerTargetEl: any;
  orgForm!: FormGroup;
  orgDrawerOptions: DrawerOptions = {
    placement: 'right',
    backdrop: true,
    bodyScrolling: true,
    edge: false,
    edgeOffset: '',
    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
    onHide: () => {
      if (this.fileDeletedNeedToSubmit) {
        this.onAddOrganization();
      }
      if (this.logoUploader) {
        this.logoUploader.clearFile();
      }
      if (this.avatarUploader) {
        this.avatarUploader.clearFile();
      }
      if (this.bannerUploader) {
        this.bannerUploader.clearFile();
      }
    }
  };

  // instance options object
  orgDrawerInstanceOptions: InstanceOptions = {
    id: 'drawer-organization',
    override: true,
  };

  drawer: DrawerInterface | undefined;
  submitted = false;
  errorMessage = '';
  selectedLogo: File | null = null;
  selectedImage: File | null = null;
  selectedAvatar: File | null = null;
  fileDeletedNeedToSubmit: boolean = false;
  status: string[] = [
    'ACTIVE',
    'INACTIVE',
    'CLOSED'
  ];

  constructor(
    private readonly _formBuilder: FormBuilder,
    private orgService: OrganizationService,
    private fileUploaderService: FileUploaderService,
  ) { }

  ngOnInit(): void {
    this.$orgDrawerTargetEl = document.getElementById('drawer-organization') as HTMLElement;
    this.$orgDrawerTargetEl.classList.remove('hidden');
    this.drawer = new Drawer(this.$orgDrawerTargetEl, this.orgDrawerOptions, this.orgDrawerInstanceOptions);
    this.drawer.hide();
    this.initializeOrgForm();
  }

  private initializeOrgForm(org: Organization | null = null) {
    if (org && org.logoImage) {
      this.logoUploader.setFile(org.logoImage.url, org.logoImage.id);
    }

    if (org && org.ownerImage) {
      this.avatarUploader.setFile(org.ownerImage.url, org.ownerImage.id);
    }

    if (org && org.bannerImage) {
      this.bannerUploader.setFile(org.bannerImage.url, org.bannerImage.id);
    }


    this.orgForm = this._formBuilder.group({
      id: [org?.id],
      orgName: [org?.orgName, Validators.required],
      orgRegNumber: [org?.orgRegNumber, Validators.required],
      orgTinNumber: [org?.orgTinNumber, Validators.required],
      orgVatNumber: [org?.orgVatNumber, Validators.required],
      orgOpenAt: [org?.orgOpenAt],
      orgOpenInWeek: [org?.orgOpenInWeek],
      orgOpeningTitle: [org?.orgOpeningTitle],
      owner: [org?.owner, Validators.required],
      orgEmail: [org?.orgEmail, [Validators.required, Validators.email]],
      orgMobileNo: [
        org?.orgMobileNo,
        [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/), Validators.minLength(11), Validators.maxLength(11)],
      ],
      since: [org?.since, Validators.required],
      ownerImage: [org?.ownerImage],
      bannerImage: [org?.bannerImage],
      logoImage: [org?.logoImage],
      orgAddressLine: [org?.orgAddressLine, [Validators.required]],
      orgAddressCity: [org?.orgAddressCity, [Validators.required]],
      orgAddressPostcode: [org?.orgAddressPostcode, [Validators.required]],
      orgAddressCountry: [org?.orgAddressCountry, [Validators.required]],
      status: [org?.status, [Validators.required]],
      vat: [org?.vat, [Validators.required]],
      tax: [org?.tax, [Validators.required]],
    });
  }

  onLogoSelection(logo: File | null) {
    this.selectedLogo = logo;
    if (!logo) {
      this.orgForm.patchValue({ logoImageId: null });
    }
  }

  onAvatarImage(avatar: File | null) {
    this.selectedAvatar = avatar;
    if (!avatar) {
      this.orgForm.patchValue({ ownerImageId: null });
    }
  }

  onBannerImage(banner: File | null) {
    this.selectedImage = banner;
    if (!banner) {
      this.orgForm.patchValue({ bannerImageId: null });
    }
  }

  openDrawer(organization: Organization | null = null) {
    this.initializeOrgForm(organization);
    this.drawer?.show();
  }

  closeDrawer() {
    this.drawer?.hide();
    this.submitted = false;
  }

  get f() {
    return this.orgForm.controls;
  }

  onFileRemoved() {
    this.fileDeletedNeedToSubmit = true;
  }

  onAddOrganization() {
    this.submitted = true;
    this.fileDeletedNeedToSubmit = false;

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

    if (this.selectedImage) {
      uploads.push(
        this.fileUploaderService.storeFile(this.selectedImage).pipe(
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
