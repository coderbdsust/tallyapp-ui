import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { UserprofileService } from 'src/app/modules/user/service/userprofile.service';
import { Address, ShortProfile, UserProfile } from './profile.model';
import { initFlowbite } from 'flowbite';
import { NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, AngularSvgIconModule, NgIf, NgFor],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  userProfile: UserProfile | undefined;
  genderList: string[] = ['Male', 'Female', 'Rather not to say', 'Custom'];
  userProfileForm!: FormGroup;
  submitted = false;

  constructor(
    private userProfileService: UserprofileService,
    private commonService: CommonService,
    private readonly _formBuilder: FormBuilder,
  ) {}

  ngOnInit(): void {
    initFlowbite();
    this.loadUserProfile();
    this.userProfileForm = this.createUserProfileForm();
  }

  createUserProfileForm(): FormGroup {
    return this._formBuilder.group({
      id: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/)]],
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
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
    console.log(selectedDate);
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

  // Utility function to get error messages dynamically
  getErrorMessage(controlName: string): string | null {
    const control = this.userProfileForm.get(controlName);
    if (control && control.errors) {
      const errorKeys = Object.keys(control.errors);
      if (errorKeys.length > 0) {
        const errorKey = errorKeys[0]; // Get the first error key
        return this.getErrorText(errorKey, control.errors[errorKey]);
      }
    }
    return null;
  }

  // Map error keys to error messages
  private getErrorText(errorKey: string, errorValue: any): string {
    const errorMessages: { [key: string]: string } = {
      required: 'This field is required.',
      minlength: `Minimum length is ${errorValue.requiredLength}.`,
      email: 'Please enter a valid email address.',
      pattern: 'Invalid format.',
    };
    return errorMessages[errorKey] || 'Invalid value.';
  }

  // Check if a field is invalid
  isFieldInvalid(controlName: string): boolean {
    const control = this.userProfileForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFormArrayErrors(formArray: FormArray, fieldErrors: { [key: string]: string }): string[] {
    const errors: string[] = [];
    formArray.controls.forEach((control, index) => {
      Object.keys(fieldErrors).forEach((field) => {
        if (control.get(field)?.hasError(fieldErrors[field])) {
          errors.push(`${fieldErrors[field]} error at index ${index}.`);
        }
      });
    });
    return errors;
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
      console.log(removedItem);
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
      console.log(removedItem);
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
    this.userProfileService.getUserProfile().subscribe(
      (userProfile) => {
        this.userProfile = userProfile;
        this.userProfileForm.patchValue({
          id: userProfile.id,
          mobileNo: userProfile.mobileNo,
          fullName: userProfile.fullName,
          gender: userProfile.gender,
          dateOfBirth: userProfile.dateOfBirth,
        });
        this.setAddresses(userProfile.addressList);
        this.setShortProfiles(userProfile.shortProfileList);
      },
      (error) => {
        this.commonService.showToastErrorResponse(error);
      },
    );
  }

  onSubmit() {
    this.submitted = true;

    if (this.userProfileForm.invalid) {
      this.commonService.showToastError('Please fill up the form');
      return;
    }

    const userProfile = this.userProfileForm.value;

    const shortProfiles: ShortProfile[] = (this.userProfileForm.get('shortProfileList') as FormArray).getRawValue();

    const addressList: Address[] = (this.userProfileForm.get('addressList') as FormArray).getRawValue();

    const apiCalls = [];

    // Add `addShortProfiles` call if shortProfiles is not empty

    apiCalls.push(this.userProfileService.addShortProfiles(shortProfiles));

    // Add `addAddresses` call if addressList is not empty
    apiCalls.push(this.userProfileService.addAddresses(addressList));

    // Always include `updateUserProfile`
    apiCalls.push(this.userProfileService.updateUserProfile(userProfile));

    forkJoin(apiCalls).subscribe({
      next: ([shortProfileResponse, addressResponse, userProfileResponse]) => {
        if (this.userProfile) {
          // Update `shortProfileList` if a response is received
          if (shortProfileResponse) {
            this.userProfile.shortProfileList = shortProfileResponse as ShortProfile[];
          }

          // Update `addressList` if a response is received
          if (addressResponse) {
            this.userProfile.addressList = addressResponse as Address[];
          }

          // Update the entire userProfile object with the final response
          this.userProfile = {
            ...this.userProfile,
            ...(userProfileResponse as UserProfile),
          };
        }
        this.userProfileService.showToastSuccess(`${this.userProfile?.fullName} your profile updated`);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      },
    });
  }
}
