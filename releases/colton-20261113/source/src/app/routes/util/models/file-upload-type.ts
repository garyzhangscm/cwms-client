import { FileUploadTemplateColumn } from './file-upload-template-column';

export interface FileUploadType {
  id: number;
  name: string;
  description: string;
  destinationUrl: string;
  templateFileUrl: string;
  trackingProgressUrl: string;
  resultUrl: string;
  columns: FileUploadTemplateColumn[];
}
