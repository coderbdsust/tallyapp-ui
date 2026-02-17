import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { ErrorResponse } from 'src/app/common/models/error-response';
import { toast } from 'ngx-sonner';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor() {}

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

  showToastInfo(message: any) {
    const msg = 'Info';
    toast.info(msg, {
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
    if (errorResponse.status !== 401) {
      let errorMessage;
      if( errorResponse.errors && errorResponse.errors.length > 0) {
         errorMessage = errorResponse.errors.map((err) => {return err.errorMessage}).join(', ');
      }
      
      toast.error('', {
        position: 'bottom-right',
        description: errorMessage || errorResponse.message,
        action: {
          label: 'Close',
          onClick: () => console.log('Action!'),
        },
        actionButtonStyle: 'background-color:#DC2626; color:white;',
      });
    } else {
      console.log(errorResponse);
    }
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

  isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }

  formatDate(y: number, m: number, d: number): string {
    const date = new Date(y, m - 1, d);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
