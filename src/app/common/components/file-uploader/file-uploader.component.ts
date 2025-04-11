import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg'
];

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss'
})
export class FileUploaderComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  allowedFileTypes = ALLOWED_FILE_TYPES;

  isUploading = false;
  @Input() fileURL!: string | null;
  uploadFile!: File | null;
  containFile: boolean = false;
  @Output() fileSelected = new EventEmitter<File|null>();

  constructor(private fileUploaderService: FileUploaderService) {
  }

  ngOnInit() {}

  handleChange(event: any) {
    this.isUploading = false;

    const file = event.target.files[0] as File;

    if (this.allowedFileTypes.indexOf(file?.type) === -1) {
      this.handleRemovesFile();
      return;
    }

    this.fileURL = URL.createObjectURL(file);
    this.uploadFile = file;
    this.containFile = true;
    this.fileSelected.emit(this.uploadFile);
  }

  ngOnChanges() {
  }

  handleRemovesFile() {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }
   
    this.removeFileFromServer(this.fileURL);
    this.isUploading = false;
    this.uploadFile = null;
    this.fileURL = null;
    this.containFile = false;
    this.fileSelected.emit(null);
  }

  handleUploadFile() {
    this.isUploading = true;

    if (this.uploadFile) {
      this.fileSelected.emit(this.uploadFile);
    }
  }

  clearFile() {
    this.uploadFile = null;
    this.fileURL = null;
    this.containFile = false;
  
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }
  
    this.fileSelected.emit(null);
  }

  setFile(fileURL: string) {   
    this.fileURL = fileURL;
    this.containFile = true;
    this.isUploading = false;
  }
  
  removeFileFromServer(fileNameURL: string|null) {
    const fileName = fileNameURL?.split('/').pop();
    if (fileName) {
      this.fileUploaderService.deleteFile(fileName).pipe(
        tap(() => {
          this.fileUploaderService.showToastSuccess('File deleted successfully');
          this.fileSelected.emit(null);
        }),
        catchError((error) => {
          //console.error('Error deleting file:', error);
          return of(null);
        })
      ).subscribe();
    }
  }
}
