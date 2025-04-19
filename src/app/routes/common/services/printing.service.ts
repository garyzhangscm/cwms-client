import { HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Lodop, LodopService } from '@delon/abc/lodop';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Printer } from '../../report/models/printer';
import { ReportHistory } from '../../report/models/report-history';
import { ReportType } from '../../report/models/report-type.enum';
import { PrinterService } from '../../report/services/printer.service';
import { PrintingRequestService } from '../../report/services/printing-request.service';
import { ReportService } from '../../report/services/report.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PrintPageOrientation } from '../models/print-page-orientation.enum';
import { PrintPageSize } from '../models/print-page-size.enum';
import { PrintableBarcode } from '../models/printable-barcode';
 

@Injectable({
  providedIn: 'root'
})
export class PrintingService {
  // printer related
  private lodop: Lodop | null = null;
  private tokenService = inject(DA_SERVICE_TOKEN);

  constructor(
    public lodopService: LodopService,
    public reportService: ReportService,
    private warehouseService: WarehouseService,
    private http: _HttpClient,
    private companyService: CompanyService,
    private localCacheService: LocalCacheService,
    private printingRequestService: PrintingRequestService,
    private messageService: NzMessageService,
  ) {
    this.lodopService.cog.url = 'http://localhost:18000/CLodopfuncs.js';
    this.lodopService.lodop.subscribe(({ lodop, ok }) => {
      if (!ok) {
        console.log(`lodop error!`);
        return;
      }

      this.lodop = lodop as Lodop;
    });
  }

  isLodopInstalled(): boolean {
    return this.lodop !== null;
  }

  getLocalPrinterCount(): number {
    if (!this.isLodopInstalled()) {
      return 0;
    }
    return this.lodop!.GET_PRINTER_COUNT();
  }

  getAllServerPrinters(printingStrategy?: PrintingStrategy): Observable<Printer[]> {
    // const url = 'resource/server-printers';
    const url = 'resource/printers';
    let params = new HttpParams();
    
    params = params.append('warehouseId', this.warehouseService.getCurrentWarehouse().id);
    console.log(`printing strategy: ${printingStrategy}`)
    
    if (printingStrategy) {
      params = params.append('printingStrategy', printingStrategy);

    } 
    return this.http.get(url, params).pipe(map(res => res.data));
  }
  getAllLocalPrinters(): string[] {
    var allLocalPrinters: string[] = [];
    const localPrinterCount = this.getLocalPrinterCount();
    console.log(`localPrinterCount: ${localPrinterCount}`);
    if (localPrinterCount === 0) {
      return allLocalPrinters;
    }
    for (var i = 0; i < localPrinterCount; i++) {
      // console.log(`printer index: ${i}, name: ${this.lodop!.GET_PRINTER_NAME(i)}`);
      allLocalPrinters.push(this.lodop!.GET_PRINTER_NAME(i));
    }
    return allLocalPrinters;
  }

  // print the file by URL. The URL may be a 3rd party URL
  // such as a parcel label from UPS / USPS / Fedex / etc

  printFileByURL(url: string, reportType: ReportType, printerName: string, physicalCopyCount: number) : void{
    
    this.localCacheService.getWarehouseConfiguration().subscribe(
      {
        next: (warehouseConfigRes) => {

          console.log(`warehouseConfigRes: ${warehouseConfigRes?.printingStrategy}`);

          // by default, we will print from the server
          if (warehouseConfigRes?.printingStrategy == null ||
                warehouseConfigRes?.printingStrategy == PrintingStrategy.SERVER_PRINTER) { 
            this.messageService.error("print from server by URL is not supported");
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) { 
            // save the request to the save so the local installed printing service will
            // print it later on 
              console.log(`will save request to the server`);
              this.savePrintingRequestByUrl(url, reportType, printerName, physicalCopyCount); 
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA) {  
              
            this.messageService.error("print from local by URL is not supported");
          }
          
        }, 
      }
    )
  }
  printFileByName(
    name: string,
    fileName: string,
    type: ReportType,
    printerIndex?: number,
    printerName: string = "",
    physicalCopyCount: number = 1,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string, 
    reportHistory?: ReportHistory,
    collated?: boolean
  ): void {


    this.localCacheService.getWarehouseConfiguration().subscribe(
      {
        next: (warehouseConfigRes) => {

          console.log(`warehouseConfigRes: ${JSON.stringify(warehouseConfigRes)}`);

          // by default, we will print from the server
          if (warehouseConfigRes?.printingStrategy == null ||
                warehouseConfigRes?.printingStrategy == PrintingStrategy.SERVER_PRINTER) { 
           
            console.log(`will print remote file from server`);
            this.printFromServer(
               fileName, type,  printerName, 
              physicalCopyCount, findPrinterBy
            );
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) { 
            // save the request to the save so the local installed printing service will
            // print it later on
            
            if (reportHistory) {
                console.log(`will save request to the server`);
                this.printReportHistoryFromLocal(reportHistory, printerIndex, printerName, 
                  physicalCopyCount, pageOrientation, collated);
                // this.savePrintingRequest(reportHistory, printerName, physicalCopyCount);
            }
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA) {  
              console.log(`print from local data is not supported at this moment`);
              this.messageService.error(`print from local data is not supported at this moment`)
                // this.printFromLocal(
                //   name, fileName, type, printerIndex, 
                //  physicalCopyCount, pageOrientation, collated); 
          }
          
        }, 
      }
    )
  }

   
  savePrintingRequest(reportHistory: ReportHistory, 
    printerName: string, copies: number) : void {

      this.printingRequestService.generatePrintingRequestByReportHistory(
        reportHistory.id, 
        printerName, copies
      ).subscribe({
        next: () => console.log(` printing request sent`)
      })
       
  }
  savePrintingRequestByUrl(url: string, reportType: ReportType, 
    printerName: string, copies: number) : void {

      this.printingRequestService.generatePrintingRequestByUrl(
        url, reportType, 
        printerName, copies
      ).subscribe({
        next: () => console.log(` printing request sent`)
      })
       
  }


  printFromServer( 
    fileName: string,
    type: ReportType, 
    printerName: string,
    physicalCopyCount: number, 
    findPrinterBy?: string, 
    collated?: boolean
  ): void { 
      console.log(`will print from the server side`);
      let params = new HttpParams();
      const url = `/resource/report-histories/print/${this.companyService.getCurrentCompany()?.id}/${
        this.warehouseService.getCurrentWarehouse().id
      }/${type}/${fileName}`;
      if (findPrinterBy) {
        params = params.append('findPrinterBy', findPrinterBy);
      }
      if (printerName) {
        params = params.append('printerName', printerName);
      }
      if (physicalCopyCount) {
        params = params.append('copies', physicalCopyCount.toString());
      }
      if (collated != null) {
        params = params.append('collated', collated);
      }
      this.http
        .post(url, params)
        .pipe(map(res => res.data))
        .subscribe(res => {
          console.log(` file printed!`);
        }); 
  }
  
  printInBatchFromServer(
    name: string,
    fileNames: string,
    type: ReportType,
    printerIndex: number,
    printerName: string,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string
  ): void { 
      console.log(`will print from the server side in a batch`);
      let params = new HttpParams();
      const url = `/resource/report-histories/print/${this.companyService.getCurrentCompany()?.id}/${
        this.warehouseService.getCurrentWarehouse().id
      }/${type}`;
      params = params.append('filenames', fileNames);
      if (findPrinterBy) {
        params = params.append('findPrinterBy', findPrinterBy);
      }
      if (printerName) {
        params = params.append('printerName', printerName);
      }
      if (physicalCopyCount) {
        params = params.append('copies', physicalCopyCount.toString());
      }
      this.http
        .post(url, params)
        .pipe(map(res => res.data))
        .subscribe(res => {
          console.log(` file printed!`);
        }); 
  }

  printReportHistoryFromLocal(reportHistory : ReportHistory, printerIndex?: number, 
        printerName?: string, 
        physicalCopyCount: number = 1,
        pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait, 
        collated?: boolean): void { 

    console.log(`start to print ${reportHistory.fileName} from printer " +
    " ${printerIndex == null ? "N/A" : printerIndex} - ${printerName == null ? "N/A" : printerName}`);
  
    if (printerIndex != null) {
      
      this.printFromLocal(
        reportHistory.fileName,
        reportHistory.fileName, 
        reportHistory.type,
        printerIndex,
        physicalCopyCount, 
        pageOrientation, 
        collated
      );
    }
    else {
      // printer index is not passed in, let's get from the printer name if it is passed in
      let printers: Map<string, number> = new Map();

      this.getAllLocalPrinters().forEach(
        (printer, index) => { 
          printers.set(printer, index);
        });
      
      if (printerName == null || !printers.has(printerName)) {
          console.log(`either pritner name not passed in or we can't find the printer, let's printer from the default printer`);
          
          this.printFromLocal(
            reportHistory.fileName,
            reportHistory.fileName, 
            reportHistory.type,
            0, // printer from default printer
            physicalCopyCount, 
            pageOrientation, 
            collated
          );
      }
      else {
        console.log(`found printer ${printerName} with index ${printers.get(printerName)}`);
        
        this.printFromLocal(
          reportHistory.fileName,
          reportHistory.fileName, 
          reportHistory.type,
          printers.get(printerName)!,
          physicalCopyCount, 
          pageOrientation, 
          collated
        );
      }
      
    }
    

  }
  printFromLocal(    
    name: string,
    fileName: string,
    type: ReportType,
    printerIndex: number, 
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait, 
    collated?: boolean
  ): void {
    
    // NOTE: use preview instead of download, which will download the label file
    // as PDF file as well. in download mode, label file will be download as 
    // ZPL file. LODOP can't process ZPL file
    // let url = `${environment.api.baseUrl}resource/report-histories/download`;
    let url = `${environment.api.baseUrl}resource/report-histories/preview`;
    url = `${url}/${this.warehouseService.getCurrentWarehouse().companyId}`;
    url = `${url}/${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}/${type}`;
    url = `${url}/${fileName}`;
    url = `${url}?token=${this.tokenService.get()?.token}`;
    url = `${url}&companyId=${this.companyService.getCurrentCompany()!.id}`


    // url = "https://localhost.lodop.net:8443/CLodopDemos/PDFDemo.pdf";

    console.log(`start to print remote file in orientation: ${pageOrientation}`);
    console.log(`START TO PRINT ${url}`);
    
    const LODOP = this.lodop!;
    LODOP.SET_LICENSES("","BE2FE2DFCE6366AF345F088D1D910455F10","","");
    //LODOP.PRINT_INITA(0, 0, 810, 610, name);
    LODOP.PRINT_INIT(name);
    // LODOP.SET_PRINT_PAGESIZE(pageOrientation, 2100, 2970, pageSize);
    LODOP.SET_PRINTER_INDEX(printerIndex); 
    // LODOP.ADD_PRINT_TEXT(0, 0, '20', '20',"This is a test printing");
    LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', this.demoDownloadPDF(url));
    // LODOP.ADD_PRINT_URL(0, 0, '100%', '100%', url);
    // LODOP.ADD_PRINT_URL(0,0, "100%","100%","http://www.baidu.com ");
    // LODOP.ADD_PRINT_PDF(0,0,"100%","100%","http://localhost:8000/CLodopDemos/PDFDemo.pdf");
    // LODOP.ADD_PRINT_PDF(-30,0,"100%","100%","e:\\AAA.pdf");
    LODOP.SET_PRINT_COPIES(physicalCopyCount); 
    if (!collated) {

      console.log(`print with NON collated`);
      LODOP.SET_PRINT_MODE("PRINT_NOCOLLATE", "true")
    }
    else {
      console.log(`print with collated`);
      LODOP.SET_PRINT_MODE("PRINT_NOCOLLATE", "false")
    }
    LODOP.PRINT();
  }

  // download the PDF to print from lodop
  async lodopDownloadPDF(pdfUrl: string): Promise<string> { 
    console.log(`start to download files from url \n${pdfUrl}`);
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');

    let responseData = await firstValueFrom(this.http.get(pdfUrl));
    console.log(`responseData \n${responseData}`);
    let result = this.getBase64(responseData);

    return result == null ? "" : result.toString();
  }

  demoDownloadPDF(pdfUrl: string)  {
    let xhr : XMLHttpRequest = new XMLHttpRequest();
    xhr.open('GET', pdfUrl, false); 
    var arraybuffer = false;
    try {
      xhr.responseType = 'arraybuffer';
      var arraybuffer = true;
      console.log(`set arraybuffer to true`);
    } 
    catch(err) {
      xhr.overrideMimeType('text/plain;charset=x-user-defined');
      console.log(`set arraybuffer to false`);
    }

    xhr.send(null);
    var data = xhr.response;
    console.log(`get response for downloading PDF\n${data}`);

    let dataArray = null;

    if (typeof Uint8Array !== 'undefined') {
      if (arraybuffer) {
        dataArray = new Uint8Array(data);
      }
      else {
        dataArray = new Uint8Array(data.length);
        for (var i = 0; i < dataArray.length; i++) {
          dataArray[i] = data.charCodeAt(i);
        }
      }
      
       console.log(`convert the data into Uint8Array\n${dataArray}`);
    }
    
    return this.getBase64(dataArray);
  }

  getBase64(dataArray: any) {
    console.log(`start to process base 64 for the data array\n${dataArray}`);

    var digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    var strData = '';
    for (var i= 0, ii = dataArray.length; i < ii; i += 3)  {
      if (isNaN(dataArray[i]))  {
        break;
      }
      var b1 = dataArray[i] & 0xff;
      var b2 = dataArray[i + 1] & 0xff;
      var b3 = dataArray[i + 2] & 0xff;       
      var d1 = b1 >> 2;
      var d2 = ((b1 & 3) << 4) | (b2 >> 4);
      var d3 = i + 1 < ii ? ((b2 & 0xf) << 2) | (b3 >> 6) : 64;
      var d4 = i + 2 < ii ? b3 & 0x3f : 64;
      strData += digits.substring(d1, d1 + 1) + digits.substring(d2, d2 + 1)  +
           digits.substring(d3, d3 + 1) + digits.substring(d4, d4 + 1);
    }
  
    console.log(`result is saved into base 64 format\n${strData}`);
    return strData;
    
  }
  print(
    name: string,
    pages: string[],
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    barcodes: PrintableBarcode[] = []
  ): void {
    const LODOP = this.lodop!;
    // Initial print task with task name
    LODOP.PRINT_INITA(10, 20, 810, 610, name);

    // LODOP.SET_PRINTER_INDEXA(this.printers['HP LaserJet 3055 PCL5']);
    // print from the default printer
    LODOP.SET_PRINTER_INDEXA(-1);

    // SET_PRINT_PAGESIZE(page-orientation, page-width, page-height, page-type)
    LODOP.SET_PRINT_PAGESIZE(pageOrientation, 2100, 2800, pageSize);

    pages.forEach((page, index) => {
      // print the content
      LODOP.ADD_PRINT_HTM(20, 10, '90%', '95%', this.addDefaultReportStyle(page));
      // If we will need to print any barcode in the page
      const currentPageBarcodes = this.getCucurrentPageBarcodes(barcodes, index);
      currentPageBarcodes.forEach(barcode =>
        LODOP.ADD_PRINT_BARCODE(barcode.top, barcode.left, barcode.width, barcode.height, barcode.barCodeType, barcode.barCodeValue)
      );
      LODOP.ADD_PRINT_HTM(990, 0, '90%', '95%', this.getCurrentPageNumberHtml(index + 1, pages.length));

      // print page foot, which is always
      if (index < pages.length - 1) {
        LODOP.NEWPAGE();
      }
    });

    LODOP.PREVIEW();
    // LODOP.PRINT();
  }

  getCucurrentPageBarcodes(barcodes: PrintableBarcode[], pageNumber: number): PrintableBarcode[] {
    return barcodes.filter(barcode => barcode.pageNumber === pageNumber);
  }

  addDefaultReportStyle(html: string): string {
    return `< style >
        h1, h2, h3, h4, h5, h6 {
          text- align: center
            }
    table {
      border - collapse: collapse;
      width: 100 %
            }

    table, th, td {
      border: 1px solid black;
      text - align: center;
      padding: 15px;
    }
    </style>
    ${html} `;
  }

  getCurrentPageNumberHtml(pageNumber: number, pageCount: number): string {
    return `< div style = "text-align: right" > Page: ${pageNumber} / ${pageCount}</div > `;
  }

  
  setupCurrentStationDefaultLabelPrinter(printer: string) {
    
    return  localStorage.setItem('default_label_printer', printer);
  }
  setupCurrentStationDefaultReportPrinter(printer: string) {
    
    return  localStorage.setItem('default_report_printer', printer);
  }
  
  getCurrentStationDefaultLabelPrinter() {
    
    return  localStorage.getItem('default_label_printer') == null ? 
                 "" : localStorage.getItem('default_label_printer');
  }
  getCurrentStationDefaultReportPrinter() {
    
    return  localStorage.getItem('default_report_printer') == null ? 
                 "" : localStorage.getItem('default_report_printer'); 
  }

  getCurrentStationDefaultPrinter(reportType: ReportType) { 
      return this.reportService.isLabel(reportType) ?
          this.getCurrentStationDefaultLabelPrinter() :
          this.getCurrentStationDefaultReportPrinter();
  }

}
