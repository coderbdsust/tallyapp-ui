import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/core/services/common.service';
import { UserprofileService } from 'src/app/core/services/userprofile.service';
import { initFlowbite } from 'flowbite';
import { NgFor, NgIf } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { forkJoin } from 'rxjs';
import { ButtonComponent } from 'src/app/common/components/button/button.component';
import { WordPipe } from 'src/app/common/pipes/word.pipe';
import { MatDialog } from '@angular/material/dialog';
import { FileUploaderComponent } from 'src/app/common/components/file-uploader/file-uploader.component';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AuthenticatorAppService } from 'src/app/core/services/authenticator-app.service';
import { AuthenticatorQrModalComponent } from '../../modal/authenticator-qr-modal/authenticator-qr-modal.component';
import { Address, ShortProfile, UserProfile } from 'src/app/core/models/profile.model';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, ReactiveFormsModule, AngularSvgIconModule, NgIf, NgFor, ButtonComponent, WordPipe, FileUploaderComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  @ViewChild(FileUploaderComponent) fileUploader!: FileUploaderComponent;
  userProfile: UserProfile | undefined;
  genderList: String[] = [];
  userProfileForm!: FormGroup;
  tfaForm!: FormGroup;
  selectedFile: File | null = null;
  submitted = false;

  constructor(
    private userProfileService: UserprofileService,
    private commonService: CommonService,
    private authService: AuthService,
    private readonly _formBuilder: FormBuilder,
    private dialog: MatDialog,
    private authenticatorAppService: AuthenticatorAppService,
    private fileUploaderService: FileUploaderService,
    private router:Router
  ) { }

  ngOnInit(): void {
    initFlowbite();
    this.loadUserProfile();
    this.loadGenderList();
    this.loadTfaStatus();
    this.userProfileForm = this.createUserProfileForm();
    this.tfaForm = this.createTfaForm();
  }

  createTfaForm(): FormGroup {
    return this._formBuilder.group({
      byEmail: [false],
      byMobile: [false],
      byAuthenticator: [false]
    });
  }

  createUserProfileForm(): FormGroup {
    return this._formBuilder.group({
      id: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^01[3-9]\d{8}$/)]],
      fullName: ['', Validators.required],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      profileImage:[''],
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

  loadTfaStatus() {
    this.userProfileService.getTfaStatus().subscribe({
      next: (tfaStatus) => {
        this.tfaForm.patchValue({
          byEmail: tfaStatus.byEmail,
          byMobile: tfaStatus.byMobile,
          byAuthenticator: tfaStatus.byAuthenticator,
        });
      },
      error: (error) => {
        this.commonService.showToastErrorResponse(error);
      }
    });
  }

  loadUserProfile() {
    this.userProfileService.getUserProfile().subscribe({
      next:(userProfile)=>{
        this.userProfile = userProfile;
        
        if(userProfile.profileImage)
          this.fileUploader.setFile(userProfile.profileImage);

        this.userProfileForm.patchValue({
          id: userProfile.id,
          mobileNo: userProfile.mobileNo,
          fullName: userProfile.fullName,
          gender: userProfile.gender,
          dateOfBirth: userProfile.dateOfBirth,
          profileImage: userProfile.profileImage
        });
        this.setAddresses(userProfile.addressList);
        this.setShortProfiles(userProfile.shortProfileList);
      },error:(error)=>{
        this.commonService.showToastErrorResponse(error);
      }
    });
  }

  loadGenderList() {
    this.authService.getGenderList().subscribe({
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
        next:(response)=>{
          userProfile.profileImage = response.fileURL;
          this.saveFormData(userProfile);
        },error:(error)=>{
          this.fileUploaderService.showToastErrorResponse(error);
        }
      })
    }else{
      this.saveFormData(userProfile);
    }
  }

  saveFormData(userProfile:any){
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
        this.userProfileService.showToastSuccess(`${this.userProfile?.fullName}, Profile Updated`);
        this.router.navigate(['/user/profile-view']);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      },
    });
  }

  onChangeTfaStatusByEmail() {
    let tfaStatus = this.tfaForm.value;
    tfaStatus.tfaEnable = tfaStatus.byEmail;
    this.userProfileService.changeTFAStatusEmail(tfaStatus).subscribe({
      next: (response) => {
        this.userProfileService.showToastSuccess(response.message);
      }
      , error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      }
    });
  }

  onChangeTfaStatusByMobile() {
    let tfaStatus = this.tfaForm.value;
    tfaStatus.tfaEnable = tfaStatus.byMobile;
    this.userProfileService.changeTFAStatusMobile(tfaStatus).subscribe({
      next: (response) => {
        this.userProfileService.showToastSuccess(response.message);
      },
      error: (error) => {
        this.userProfileService.showToastErrorResponse(error);
      }
    });
  }

  onChangeTfaStatusByAuthenticator() {
    let byAuthenticator = this.tfaForm.get('byAuthenticator')?.value;

    const dialogRef = this.dialog.open(AuthenticatorQrModalComponent, {
      width: '500px',
      data: byAuthenticator
    });

    dialogRef.afterClosed().subscribe(otp => {
      if (otp) {
        const control = this.tfaForm.get('byAuthenticator');

        if (byAuthenticator) {
          this.authenticatorAppService.authenticatorAppTfaEnable(otp).subscribe({
            next: (response) => {
              this.authenticatorAppService.showToastSuccess(response.message);
            },
            error: (error) => {
              this.authService.showToastErrorResponse(error);
              control?.setValue(false, { emitEvent: false }); // revert
            }
          });
        } else {
          this.authenticatorAppService.authenticatorAppTfaDisable(otp).subscribe({
            next: (response) => {
              this.authenticatorAppService.showToastSuccess(response.message);
            },
            error: (error) => {
              this.authService.showToastErrorResponse(error);
              control?.setValue(true, { emitEvent: false }); // revert
            }
          });
        }
      } else {
        // If modal closed without submitting OTP, revert checkbox
        this.tfaForm.get('byAuthenticator')?.setValue(!byAuthenticator, { emitEvent: false });
      }
    });
  }

}
