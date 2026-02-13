import { AbstractControl, FormControl, FormGroup } from "@angular/forms";

export class FormError {

  // Utility function to get error messages dynamically
  getErrorMessage(form: FormGroup, controlName: string): string | null {
    const control = form.get(controlName);
    if (control && control.errors) {
      const errorKeys = Object.keys(control.errors);
      if (errorKeys.length > 0) {
        const errorKey = errorKeys[0]; // Get the first error key
        return this.getErrorText(errorKey, control.errors[errorKey]);
      }
    }
    return null;
  }

  getErrorMessageFromControl(group: AbstractControl, controlName:string): string | null {
    const control = this.getControl(group, controlName);
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
      min: `Minimum value is ${errorValue.min}`,
      max: `Maximum value is ${errorValue.max}`,
      minlength: `Minimum length is ${errorValue.requiredLength}.`,
      maxlength: `Maximum length is ${errorValue.requiredLength}.`,
      email: 'Please enter a valid email address.',
      pattern: 'Invalid format.',
    };
    return errorMessages[errorKey] || 'Invalid value.';
  }

  // Check if a field is invalid
  isFieldInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isFieldInvalidControl(group: AbstractControl, controlName:string): boolean {
    const control = this.getControl(group, controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getControl(control: AbstractControl, controlName: string): FormControl {
    return control.get(controlName) as FormControl;
  }

}