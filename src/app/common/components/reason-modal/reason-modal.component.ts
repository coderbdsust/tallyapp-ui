import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule } from 'angular-svg-icon';

@Component({
  selector: 'app-reason-modal',
  imports: [MatDialogModule, AngularSvgIconModule, FormsModule, TranslateModule],
  templateUrl: './reason-modal.component.html',
  styleUrl: './reason-modal.component.scss'
})
export class ReasonModalComponent {
  reason = '';

  constructor(
    public dialogRef: MatDialogRef<ReasonModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onConfirm(): void {
    this.dialogRef.close({ confirmed: true, reason: this.reason });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
