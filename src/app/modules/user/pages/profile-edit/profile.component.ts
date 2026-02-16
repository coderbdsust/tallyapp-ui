import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { initFlowbite } from 'flowbite';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { forkJoin } from 'rxjs';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { FileUploaderComponent } from 'src/app/common/components/file-uploader/file-uploader.component';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { Router } from '@angular/router';
import { Address, ShortProfile, UserProfile } from 'src/app/core/models/profile.model';
import { FormError } from 'src/app/common/components/form-error/form-error.component';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, ReactiveFormsModule, AngularSvgIconModule, NgIf, NgFor, NgClass, ButtonComponent, WordPipe, FileUploaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent extends FormError implements OnInit {
  @ViewChild(FileUploaderComponent) fileUploader!: FileUploaderComponent;
  userProfile: UserProfile | undefined;
  genderList: String[] = [];
  userProfileForm!: FormGroup;
  selectedFile: File | null = null;
  submitted = false;

  constructor(
    private userProfileService: UserprofileService,
    private commonService: CommonService,
    private readonly _formBuilder: FormBuilder,
    private fileUploaderService: FileUploaderService,
    private router: Router
  ) { super(); }

  ngOnInit(): void {
    initFlowbite();
    this.loadUserProfile();
    this.loadGenderList();
    this.userProfileForm = this.createUserProfileForm();
  }

  createUserProfileForm(): FormGroup {
    return this._formBuilder.group({
      id: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      profileImage: [''],
      addressList: this._formBuilder.array([]),
      shortProfileList: this._formBuilder.array([]),
    });
  }

  // Function to create the Address form group
  createAddressForm(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      addressLine: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]],
      country: ['', Validators.required],
    });
  }

  // Function to create the ShortProfile form group
  createShortProfileForm(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      designation: ['', Validators.required],
      skills: ['', Validators.required],
      companyName: ['', Validators.required],
    });
  }

  // Helper to get addressList FormArray
  get addressList(): FormArray {
    return this.userProfileForm.get('addressList') as FormArray;
  }

  // Helper to get shortProfileList FormArray
  get shortProfileList(): FormArray {
    return this.userProfileForm.get('shortProfileList') as FormArray;
  }

  onDateChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedDate = inputElement.value;
    this.userProfileForm.get('dateOfBirth')?.setValue(selectedDate);
  }

  setAddresses(addressList: Address[]): void {
    const addressArray = this.userProfileForm.get('addressList') as FormArray;
    addressList.forEach((address) => {
      addressArray.push(
        this._formBuilder.group({
          id: [address.id],
          addressLine: [address.addressLine, Validators.required],
          city: [address.city, Validators.required],
          state: [address.state, Validators.required],
          postCode: [address.postCode, [Validators.required, Validators.pattern('^[0-9]{4}$')]],
          country: [address.country, Validators.required],
        }),
      );
    });
  }

  // Function to set short profiles in the form
  setShortProfiles(shortProfiles: ShortProfile[]): void {
    const shortProfileArray = this.userProfileForm.get('shortProfileList') as FormArray;
    shortProfiles.forEach((profile) => {
      shortProfileArray.push(
        this._formBuilder.group({
          id: [profile.id],
          designation: [profile.designation, Validators.required],
          skills: [profile.skills, Validators.required],
          companyName: [profile.companyName, Validators.required],
        }),
      );
    });
  }

  // Add address
  addAddress(): void {
    this.submitted = false;
    this.addressList.push(this.createAddressForm());
  }

  // Remove address
  removeAddress(index: number): void {
    const removedItem = this.addressList.at(index).value;
    if (removedItem?.id) {
      this.userProfileService.deleteAddress(removedItem.id).subscribe({
        next: (response) => {
          this.userProfileService.showToastSuccess(response.message);
          this.addressList.removeAt(index);
        },
        error: (error) => {
          this.userProfileService.showToastErrorResponse(error);
        },
      });
    } else this.addressList.removeAt(index);
  }

  // Add short profile
  addShortProfile(): void {
    this.submitted = false;
    this.shortProfileList.push(this.createShortProfileForm());
  }

  // Remove short profile
  removeShortProfile(index: number): void {
    const removedItem = this.shortProfileList.at(index).value;
    if (removedItem?.id) {
      this.userProfileService.deleteShortProfile(removedItem.id).subscribe({
        next: (response) => {
          this.userProfileService.showToastSuccess(response.message);
          this.shortProfileList.removeAt(index);
        },
        error: (error) => {
          this.userProfileService.showToastErrorResponse(error);
        },
      });
    } else this.shortProfileList.removeAt(index);
  }

  loadUserProfile() {
    this.userProfileService.getUserProfile().subscribe({
      next: (userProfile) => {
        this.userProfile = userProfile;

        if (userProfile.profileImage)
          this.fileUploader.setFile(userProfile.profileImage);

        this.userProfileForm.patchValue({
          id: userProfile.id,
          mobileNo: userProfile.mobileNo,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          gender: userProfile.gender,
          dateOfBirth: userProfile.dateOfBirth,
          profileImage: userProfile.profileImage
        });
        this.setAddresses(userProfile.addressList);
        this.setShortProfiles(userProfile.shortProfileList);
      }, error: (error) => {
        this.commonService.showToastErrorResponse(error);
      }
    });
  }

  loadGenderList() {
    this.userProfileService.getGenderList().subscribe({
      next: (genderList) => {
        this.genderList = genderList;
      },
      error: (error) => {
        this.commonService.showToastErrorResponse(error);
      },
    });
  }

  onAvatarSelect(file: File | null) {
    this.selectedFile = file;
    if (!file) {
      this.userProfileForm.patchValue({ profileImage: null });
    }
  }

  onFileDeleted() {
    this.userProfileForm.patchValue({ profileImage: null });
    this.onSubmit();
  }

  onSubmit() {
    this.submitted = true;

    if (this.userProfileForm.invalid) {
      this.commonService.showToastError('Please fill up the form');
      return;
    }
    let userProfile = this.userProfileForm.value;

    if (this.selectedFile) {
      this.fileUploaderService.uploadFile(this.selectedFile).subscribe({
        next: (response) => {
          userProfile.profileImage = response.fileURL;
          this.saveFormData(userProfile);
        }, error: (error) => {
          this.fileUploaderService.showToastErrorResponse(error);
        }
      })
    } else {
      this.saveFormData(userProfile);
    }
  }

  saveFormData(userProfile: any) {
    const shortProfiles: ShortProfile[] = (this.userProfileForm.get('shortProfileList') as FormArray).getRawValue();
    const addressList: Address[] = (this.userProfileForm.get('addressList') as FormArray).getRawValue();

    const apiCalls = [];

    // Add `addShortProfiles` call only if shortProfiles is not empty
    if (shortProfiles && shortProfiles.length > 0) {
      apiCalls.push(this.userProfileService.addShortProfiles(shortProfiles));
    }

    // Add `addAddresses` call only if addressList is not empty
    if (addressList && addressList.length > 0) {
      apiCalls.push(this.userProfileService.addAddresses(addressList));
    }

    // Add `updateUserProfile` only if userProfile has data
    if (userProfile && Object.keys(userProfile).length > 0) {
      apiCalls.push(this.userProfileService.updateUserProfile(userProfile));
    }

    // Only proceed if there are API calls to make
    if (apiCalls.length === 0) {
      this.userProfileService.showToastSuccess('No changes to save');
      return;
    }

    forkJoin(apiCalls).subscribe({
      next: (responses) => {
        if (this.userProfile) {
          let responseIndex = 0;

          // Update `shortProfileList` if it was included in the API calls
          if (shortProfiles && shortProfiles.length > 0) {
            this.userProfile.shortProfileList = responses[responseIndex] as ShortProfile[];
            responseIndex++;
          }

          // Update `addressList` if it was included in the API calls
          if (addressList && addressList.length > 0) {
            this.userProfile.addressList = responses[responseIndex] as Address[];
            responseIndex++;
          }

          // Update the entire userProfile object if it was included
          if (userProfile && Object.keys(userProfile).length > 0) {
            this.userProfile = {
              ...this.userProfile,
              ...(responses[responseIndex] as UserProfile),
            };
          }
        }
        this.userProfileService.showToastSuccess(`${this.userProfile?.fullName}, Profile Updated`);
        this.router.navigate(['/user/profile-view']);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      },
    });
  }

}
