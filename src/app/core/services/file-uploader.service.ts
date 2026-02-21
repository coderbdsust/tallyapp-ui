import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { environment } from 'src/environments/environment';
import { FileUploadResponse } from '../models/file-upload-response.model';

@Injectable({
  providedIn: 'root',
})
export class FileUploaderService extends CommonService {

  constructor(private http: HttpClient) {
    super();
  }

  public storeFile(file: File) {
    const formData = new FormData();
    formData.append('fileName', file, file.name);

    return this.http
      .post<FileUploadResponse>(`${environment.tallyURL}/file-upload/v2/`, formData)
      .pipe(catchError(this.mapErrorResponse));
  }

  public deleteFileById(fileId: string) {
    return this.http
      .delete(`${environment.tallyURL}/file-upload/v2/${fileId}`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
