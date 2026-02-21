export interface FileUploadResponse {
  id: string;
  originalName: string;
  storedName: string;
  filePath: string;
  url: string | 'https://placehold.co/400';
}