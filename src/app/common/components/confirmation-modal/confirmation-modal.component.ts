import { Component, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { AngularSvgIconModule } from 'angular-svg-icon';


@Component({
    selector: 'app-confirmation-modal',
    imports: [MatDialogModule, AngularSvgIconModule],
    templateUrl: './confirmation-modal.component.html',
    styleUrl: './confirmation-modal.component.scss'
})
export class ConfirmationModalComponent {

    constructor(
        public dialogRef: MatDialogRef<ConfirmationModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string }
      ) {}
    
      onConfirm(): void {
        this.dialogRef.close(true);
      }
    
      onCancel(): void {
        this.dialogRef.close(false);
      }
}
