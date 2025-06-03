import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { DrawerInterface, DrawerOptions, InstanceOptions } from 'flowbite';
import { Drawer } from 'flowbite';
import { Organization } from '../../service/model/organization.model';
import { OrganizationService } from '../../service/organization.service';
import { FileUploaderComponent } from 'src/app/common/components/file-uploader/file-uploader.component';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { catchError, forkJoin, map, of, switchMap, throwError } from 'rxjs';

@Component({
  selector: 'app-add-organization',
  imports: [
    AngularSvgIconModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonComponent,
    FileUploaderComponent,
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
      if(this.logoUploader) {
        this.logoUploader.clearFile();
      }
      if(this.avatarUploader) {
        this.avatarUploader.clearFile();
      }
      if(this.bannerUploader) {
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
    if (org && org.logo) {
      this.logoUploader.setFile(org.logo);
    }

    if (org && org.avatar) {
      this.avatarUploader.setFile(org.avatar);
    }

    if (org && org.image) {
      this.bannerUploader.setFile(org.image);
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
      image: [org?.image],
      avatar: [org?.avatar],
      logo: [org?.logo],
      orgAddressLine: [org?.orgAddressLine, [Validators.required]],
      orgAddressCity: [org?.orgAddressCity, [Validators.required]],
      orgAddressPostcode: [org?.orgAddressPostcode, [Validators.required]],
      orgAddressCountry: [org?.orgAddressCountry, [Validators.required]],
      status: ['ACTIVE', [Validators.required]],
    });
  }

  onLogoSelection(logo: File | null) {
    this.selectedLogo = logo;
    if (!logo) {
      this.orgForm.patchValue({ logo: null });
    }
  }

  onAvatarImage(avatar: File | null) {
    this.selectedAvatar = avatar;
    if (!avatar) {
      this.orgForm.patchValue({ avatar: null });
    }
  }

  onBannerImage(banner: File | null) {
    this.selectedImage = banner;
    if (!banner) {
      this.orgForm.patchValue({ image: null });
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


  onAddOrganization() {
    this.submitted = true;

    if (this.orgForm.invalid) {
      return;
    }

    const organizationData = { ...this.orgForm.value }; // Create a copy
    const uploads = [];

    // Create upload observables that return the field name and URL
    if (this.selectedLogo) {
      uploads.push(
        this.fileUploaderService.uploadFile(this.selectedLogo).pipe(
          map((response: any) => ({ field: 'logo', url: response.fileURL })),
          catchError((error) => {
            this.orgService.showToastErrorResponse(error);
            return throwError(() => error);
          })
        )
      );
    }

    if (this.selectedAvatar) {
      uploads.push(
        this.fileUploaderService.uploadFile(this.selectedAvatar).pipe(
          map((response: any) => ({ field: 'avatar', url: response.fileURL })),
          catchError((error) => {
            this.orgService.showToastErrorResponse(error);
            return throwError(() => error);
          })
        )
      );
    }

    if (this.selectedImage) {
      uploads.push(
        this.fileUploaderService.uploadFile(this.selectedImage).pipe(
          map((response: any) => ({ field: 'image', url: response.fileURL })),
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
          // Apply all upload results to organizationData
          uploadResults.forEach((result: any) => {
            if (result && result.field && result.url) {
              organizationData[result.field] = result.url;
            }
          });

          console.log('Final organization data:', organizationData);
          return this.orgService.addOrganization(organizationData);
        })
      )
      .subscribe({
        next: (org) => {
          this.orgEmitter.emit(org);
          this.orgForm.patchValue({ id: org.id });
          this.orgService.showToastSuccess('Organization saved successfully');
          this.closeDrawer();
        },
        error: (error) => {
          this.orgService.showToastErrorResponse(error);
        },
      });
  }

}
