import { FileUploadTemplateColumn } from './file-upload-template-column';

export interface FileUploadColumnMapping {
  id?: number;
  
  companyId: number;
  warehouseId: number;

  type: string;
  columnName: string;
  mapToColumnName: string;
 
}
