import { PrintingRequestResult } from "./printing-request-result";
 

export interface PrintingJob {
  
  printingTime: number;

  printerName: string;

  printingJobName: string;

  result: PrintingRequestResult;
}
