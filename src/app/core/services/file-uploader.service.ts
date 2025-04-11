import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { CommonService } from 'src/app/modules/auth/services/common.service';
import { environment } from 'src/environments/environment';

export interface FileUploadResponse {
  fileName: string;
  fileURL: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService extends CommonService {
    
  constructor(private http: HttpClient) {
    super();
  }

  public uploadFile(file: File) {
    const formData = new FormData();
    formData.append('fileName', file, file.name);

    return this.http
      .post<FileUploadResponse>(`${environment.tallyURL}/file-upload/v1/`, formData)
      .pipe(catchError(this.mapErrorResponse));
  }

  public deleteFile(fileName: string) {
    return this.http
      .delete(`${environment.tallyURL}/file-upload/v1/${fileName}`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
