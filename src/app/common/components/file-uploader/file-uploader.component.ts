import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { catchError, of, tap } from 'rxjs';
import { FileUploaderService } from 'src/app/core/services/file-uploader.service';

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg'
];

export type FileUploaderShape = 'rectangle' | 'avatar';

@Component({
  selector: 'app-file-uploader',
  imports: [CommonModule, AngularSvgIconModule],
  templateUrl: './file-uploader.component.html',
  styleUrl: './file-uploader.component.scss'
})
export class FileUploaderComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;

  allowedFileTypes = ALLOWED_FILE_TYPES;

  // New shape input parameter
  @Input() shape: FileUploaderShape = 'rectangle';
  isUploading = false;
  @Input() fileURL!: string | null;
  @Input() uploadedFileId: string | null = null;
  uploadFile!: File | null;
  containFile: boolean = false;
  @Output() fileSelected = new EventEmitter<File|null>();
  @Output() fileRemoved = new EventEmitter<void>();

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

    this.removeFileFromServer(this.uploadedFileId);
    this.isUploading = false;
    this.uploadFile = null;
    this.fileURL = null;
    this.uploadedFileId = null;
    this.containFile = false;
    this.fileSelected.emit(null);
    this.fileRemoved.emit();
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
    this.uploadedFileId = null;
    this.containFile = false;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = null;
    }

    this.fileSelected.emit(null);
  }

  setFile(fileURL: string, fileId?: string) {   
    this.fileURL = fileURL;
    this.uploadedFileId = fileId ?? null;
    this.containFile = true;
    this.isUploading = false;
  }
  
    removeFileFromServer(fileId: string | null) {
    if (fileId) {
      this.fileUploaderService.deleteFileById(fileId).pipe(
        tap(() => {
          this.fileUploaderService.showToastSuccess('File deleted successfully');
          this.fileSelected.emit(null);
        }),
        catchError((error) => {
          return of(null);
        })
      ).subscribe();
    }
  }
}