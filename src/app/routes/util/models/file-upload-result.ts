import { FileUploadTemplateColumn } from './file-upload-template-column';

export interface FileUploadResult {
 
  lineNumber: number;
  record: string;
  result: string;
  errorMessage: string;
}
