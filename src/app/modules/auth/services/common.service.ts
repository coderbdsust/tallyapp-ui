import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {  throwError } from 'rxjs';
import { ErrorResponse } from 'src/app/common/models/error-response';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() { }

  mapErrorResponse(errorRes: HttpErrorResponse) {
    
    const errorMessage = 'An unknown error occurred';

    if (!errorRes.error || !errorRes.error.message) {
      const errorResponse = new ErrorResponse(
        new Date().toISOString(),
        errorRes.status,
        errorMessage,
        errorRes.error?.name || 'Unknown',
        errorRes.url || '',
        [], 
      );
      return throwError(() => errorResponse);
    }
    
    const errorResponse = new ErrorResponse(
      new Date(errorRes.error.timestamp).toISOString(),
      errorRes.status,
      errorRes.error.message || errorMessage,
      errorRes.error.error || 'Unknown',
      errorRes.error.path || '',
      errorRes.error.errors || [],
    );
    return throwError(() => errorResponse);
  }

  decodeToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  showToastError(message: any) {
    const msg = 'Error';
    toast.error(msg, {
      position: 'bottom-right',
      description: message,
      action: {
        label: 'Close',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  showToastErrorResponse(errorResponse: ErrorResponse) {
    //const msg = errorResponse?.status+"";
    toast.error('', {
      position: 'bottom-right',
      description: errorResponse.message,
      action: {
        label: 'Close',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }

  showToastSuccess(message: any) {
    const msg = 'Success';
    toast.success('', {
      position: 'bottom-right',
      description: message,
      action: {
        label: 'Close',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color: #006400; color:white;',
    });
  }
}
