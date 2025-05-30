import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp',
  imports: [FormsModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.scss'
})
export class OtpComponent {
  @Input() length: number = 6;
  @Output() otpChange = new EventEmitter<string>();

  inputs: string[] = Array(this.length).fill('');
  submitted = false;
  errorMessage = '';

  isNumeric(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  onInput(event: Event, index: number) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.value.length === 1 && index < this.inputs.length - 1) {
      const nextInput = inputElement.nextElementSibling as HTMLInputElement;
      nextInput?.focus();
    }
    this.emitOtp();
  }

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData?.getData('text') || '';
    if (clipboardData.length === this.length) {
      for (let i = 0; i < this.length; i++) {
        this.inputs[i] = clipboardData[i] || '';
      }
      event.preventDefault();
      this.emitOtp();
    }
  }

  emitOtp() {
    const otp = this.inputs.join('');
    this.otpChange.emit(otp);
  }
}
