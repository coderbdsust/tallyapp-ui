import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { initFlowbite } from 'flowbite';
import { NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { catchError, forkJoin, of } from 'rxjs';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { Router } from '@angular/router';
import { Address, ShortProfile, UserProfile } from 'src/app/core/models/profile.model';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-profile',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    NgIf,
    NgFor,
    WordPipe,
    // FileUploaderComponent removed — avatar handled inline
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent extends FormError implements OnInit {
  // ── Inline avatar ref ─────────────────────────────────────────────────
  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

  userProfile: UserProfile | undefined;
  genderList: String[] = [];
  userProfileForm!: FormGroup;
  submitted = false;

  // ── Avatar state ──────────────────────────────────────────────────────
  avatarPreviewUrl: string | null = null;
  selectedFile: File | null = null;
  existingFileId: string | null = null;

  constructor(
    private userProfileService: UserprofileService,
    private commonService: CommonService,
    private readonly _formBuilder: FormBuilder,
    private fileUploaderService: FileUploaderService,
    private router: Router
  ) { super(); }

  ngOnInit(): void {
    initFlowbite();
    this.userProfileForm = this.createUserProfileForm();
    this.loadUserProfile();
    this.loadGenderList();
  }

  // ── Form builders ─────────────────────────────────────────────────────

  createUserProfileForm(): FormGroup {
    return this._formBuilder.group({
      id:              ['', Validators.required],
      mobileNo:        ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/)]],
      firstName:       ['', Validators.required],
      lastName:        ['', Validators.required],
      gender:          ['', Validators.required],
      dateOfBirth:     ['', Validators.required],
      profileImage:    [''],
      addressList:     this._formBuilder.array([]),
      shortProfileList: this._formBuilder.array([]),
    });
  }

  createAddressForm(): FormGroup {
    return this._formBuilder.group({
      id:          [''],
      addressLine: ['', Validators.required],
      city:        ['', Validators.required],
      state:       ['', Validators.required],
      postCode:    ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      country:     ['', Validators.required],
    });
  }

  createShortProfileForm(): FormGroup {
    return this._formBuilder.group({
      id:          [''],
      designation: ['', Validators.required],
      skills:      ['', Validators.required],
      companyName: ['', Validators.required],
    });
  }

  // ── FormArray getters ─────────────────────────────────────────────────

  get addressList(): FormArray {
    return this.userProfileForm.get('addressList') as FormArray;
  }

  get shortProfileList(): FormArray {
    return this.userProfileForm.get('shortProfileList') as FormArray;
  }

  // ── Populate FormArrays ───────────────────────────────────────────────

  setAddresses(addresses: Address[]): void {
    const arr = this.userProfileForm.get('addressList') as FormArray;
    addresses.forEach(a => arr.push(this._formBuilder.group({
      id:          [a.id],
      addressLine: [a.addressLine, Validators.required],
      city:        [a.city,        Validators.required],
      state:       [a.state,       Validators.required],
      postCode:    [a.postCode,    [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      country:     [a.country,     Validators.required],
    })));
  }

  setShortProfiles(profiles: ShortProfile[]): void {
    const arr = this.userProfileForm.get('shortProfileList') as FormArray;
    profiles.forEach(p => arr.push(this._formBuilder.group({
      id:          [p.id],
      designation: [p.designation, Validators.required],
      skills:      [p.skills,      Validators.required],
      companyName: [p.companyName, Validators.required],
    })));
  }

  // ── Add / Remove ──────────────────────────────────────────────────────

  addAddress(): void {
    this.submitted = false;
    this.addressList.push(this.createAddressForm());
  }

  removeAddress(index: number): void {
    const item = this.addressList.at(index).value;
    if (item?.id) {
      this.userProfileService.deleteAddress(item.id).subscribe({
        next: res => {
          this.userProfileService.showToastSuccess(res.message);
          this.addressList.removeAt(index);
        },
        error: err => this.userProfileService.showToastErrorResponse(err),
      });
    } else {
      this.addressList.removeAt(index);
    }
  }

  addShortProfile(): void {
    this.submitted = false;
    this.shortProfileList.push(this.createShortProfileForm());
  }

  removeShortProfile(index: number): void {
    const item = this.shortProfileList.at(index).value;
    if (item?.id) {
      this.userProfileService.deleteShortProfile(item.id).subscribe({
        next: res => {
          this.userProfileService.showToastSuccess(res.message);
          this.shortProfileList.removeAt(index);
        },
        error: err => this.userProfileService.showToastErrorResponse(err),
      });
    } else {
      this.shortProfileList.removeAt(index);
    }
  }

  // ── Data loading ──────────────────────────────────────────────────────

  loadUserProfile(): void {
    this.userProfileService.getUserProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;

        // Set avatar inline
        if (profile.profileImage) {
          this.avatarPreviewUrl = profile.profileImage.url;
          this.existingFileId   = profile.profileImage.id ?? null;
          this.userProfileForm.patchValue({ profileImage: profile.profileImage });
        }

        this.userProfileForm.patchValue({
          id:           profile.id,
          mobileNo:     profile.mobileNo,
          firstName:    profile.firstName,
          lastName:     profile.lastName,
          gender:       profile.gender,
          dateOfBirth:  profile.dateOfBirth,
        });

        this.setAddresses(profile.addressList);
        this.setShortProfiles(profile.shortProfileList);
      },
      error: (err) => this.commonService.showToastErrorResponse(err),
    });
  }

  loadGenderList(): void {
    this.userProfileService.getGenderList().subscribe({
      next: list => this.genderList = list,
      error: err  => this.commonService.showToastErrorResponse(err),
    });
  }

  // ── Avatar handlers ───────────────────────────────────────────────────

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) return;

    this.selectedFile     = file;
    this.avatarPreviewUrl = URL.createObjectURL(file);
    this.userProfileForm.patchValue({ profileImage: file });
  }

  onRemoveAvatar(): void {
    // Delete from server if previously uploaded
    if (this.existingFileId) {
      this.fileUploaderService.deleteFileById(this.existingFileId).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    this.selectedFile     = null;
    this.avatarPreviewUrl = null;
    this.existingFileId   = null;
    if (this.avatarInput?.nativeElement) this.avatarInput.nativeElement.value = '';
    this.userProfileForm.patchValue({ profileImage: null });

    // Persist the removal immediately
    this.onSubmit();
  }

  // ── Submit ────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.submitted = true;

    if (this.userProfileForm.invalid) {
      this.commonService.showToastError('Please fill up the form');
      return;
    }

    const userProfile = { ...this.userProfileForm.value };

    if (this.selectedFile) {
      this.fileUploaderService.storeFile(this.selectedFile).subscribe({
        next: (res) => {
          userProfile.profileImage = res;
          this.saveFormData(userProfile);
        },
        error: (err) => this.fileUploaderService.showToastErrorResponse(err),
      });
    } else {
      this.saveFormData(userProfile);
    }
  }

  saveFormData(userProfile: any): void {
    const shortProfiles: ShortProfile[] = (this.userProfileForm.get('shortProfileList') as FormArray).getRawValue();
    const addressList:   Address[]       = (this.userProfileForm.get('addressList') as FormArray).getRawValue();
    const apiCalls: any[] = [];

    if (shortProfiles.length > 0) apiCalls.push(this.userProfileService.addShortProfiles(shortProfiles));
    if (addressList.length > 0)   apiCalls.push(this.userProfileService.addAddresses(addressList));
    if (Object.keys(userProfile).length > 0) apiCalls.push(this.userProfileService.updateUserProfile(userProfile));

    if (apiCalls.length === 0) {
      this.userProfileService.showToastSuccess('No changes to save');
      return;
    }

    forkJoin(apiCalls).subscribe({
      next: (responses) => {
        if (this.userProfile) {
          let idx = 0;
          if (shortProfiles.length > 0) { this.userProfile.shortProfileList = responses[idx++] as ShortProfile[]; }
          if (addressList.length > 0)   { this.userProfile.addressList       = responses[idx++] as Address[]; }
          if (Object.keys(userProfile).length > 0) {
            this.userProfile = { ...this.userProfile, ...(responses[idx] as UserProfile) };
          }
        }
        this.userProfileService.showToastSuccess(`${this.userProfile?.fullName}, Profile Updated`);
        this.router.navigate(['/user/profile-view']);
      },
      error: (err) => this.userProfileService.showToastErrorResponse(err),
    });
  }
}