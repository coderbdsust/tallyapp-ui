export class ErrorResponse {
    timestamp?: string;
    status?: number;
    message?: string;
    error?: string;
    path?: string;
    errors?: any[];
  
    constructor(
      timestamp: string,
      status: number,
      message: string,
      error: string,
      path: string,
      errors: any[]
    ) {
      this.timestamp = timestamp;
      this.status = status;
      this.message = message;
      this.error = error;
      this.path = path;
      this.errors = errors;
    }

    getFormattedTimestamp(): any {

      if(!this.timestamp){
        return "Invalid Date";
      }

      const date = new Date(this.timestamp);

      const formattedDate = date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      
      return formattedDate;
    }
  }