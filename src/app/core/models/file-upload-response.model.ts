export interface FileUploadResponse {
  id: string;
  fileName: string;
  fileURL: string | 'https://placehold.co/400';
  originalName: string;
  storedName: string;
  filePath: string;
  url: string | 'https://placehold.co/400';
}