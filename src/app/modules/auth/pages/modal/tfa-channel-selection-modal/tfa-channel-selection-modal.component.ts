import { CommonModule, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule, NgModel } from '@angular/forms';
import { AppComponent } from 'src/app/app.component';
import { ButtonComponent } from 'src/app/common/components/button/button.component';

@Component({
  selector: 'app-tfa-channel-selection-modal',
  templateUrl: './tfa-channel-selection-modal.component.html',
  imports: [CommonModule, MatDialogModule, MatRadioModule, MatButtonModule, FormsModule, ButtonComponent, NgIf],
})
export class TfaChannelSelectionModalComponent {
  constructor(
    public dialogRef: MatDialogRef<TfaChannelSelectionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  selectedChannel: 'Email' | 'Mobile' | 'Authenticator' = 'Email';

  choose(channel: 'Email' | 'Mobile' | 'Authenticator') {
    this.dialogRef.close(channel);
  }

  onNoClick(){
    this.dialogRef.close();
  }
}
