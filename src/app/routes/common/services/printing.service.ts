import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Lodop, LodopService } from '@delon/abc/lodop';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ReportHistory } from '../../report/models/report-history';
import { ReportType } from '../../report/models/report-type.enum';
import { PrintingRequestService } from '../../report/services/printing-request.service';
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

  constructor(
    public lodopService: LodopService,
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

  getAllServerPrinters(printingStrategy?: PrintingStrategy): Observable<string[]> {
    const url = 'resource/server-printers';
    
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
    if (localPrinterCount === 0) {
      return allLocalPrinters;
    }
    for (var i = 0; i < localPrinterCount; i++) {
      console.log(`printer index: ${i}, name: ${this.lodop!.GET_PRINTER_NAME(i)}`);
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
    printerIndex: number,
    printerName: string,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string, 
    reportHistory?: ReportHistory,
  ): void {

    this.localCacheService.getWarehouseConfiguration().subscribe(
      {
        next: (warehouseConfigRes) => {

          console.log(`warehouseConfigRes: ${warehouseConfigRes?.printingStrategy}`);

          // by default, we will print from the server
          if (warehouseConfigRes?.printingStrategy == null ||
                warehouseConfigRes?.printingStrategy == PrintingStrategy.SERVER_PRINTER) { 
           
            console.log(`will print remote file from server`);
            this.printFromServer(
              name, fileName, type, printerIndex, printerName, 
              physicalCopyCount, pageOrientation, pageSize, findPrinterBy
            );
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) { 
            // save the request to the save so the local installed printing service will
            // print it later on
            
            if (reportHistory) {
              console.log(`will save request to the server`);
              
                this.savePrintingRequest(reportHistory, printerName, physicalCopyCount);
            }
          }
          else if (warehouseConfigRes?.printingStrategy == PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA) {  
              
                this.printFromLocal(
                  name, fileName, type, printerIndex, printerName, 
                  physicalCopyCount, pageOrientation, pageSize, findPrinterBy); 
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
    name: string,
    fileName: string,
    type: ReportType,
    printerIndex: number,
    printerName: string,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string
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

  printFromLocal(    
    name: string,
    fileName: string,
    type: ReportType,
    printerIndex: number,
    printerName: string,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string 
  ): void {
    
    let url = `${environment.api.baseUrl}/resource/report-histories/download`;

    url = `${url}/${this.warehouseService.getCurrentWarehouse().companyId}`;
    url = `${url}/${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}/${type}`;
    url = `${url}/${fileName}`;


    console.log(`start to print remote file in orientation: ${pageOrientation}`);
    console.log(`START TO PRINT ${url}`);
    const LODOP = this.lodop!;
    //LODOP.PRINT_INITA(0, 0, 810, 610, name);
    LODOP.PRINT_INIT(name);
    LODOP.SET_PRINT_PAGESIZE(pageOrientation, 2100, 2970, pageSize);
    LODOP.SET_PRINTER_INDEX(printerIndex);
    LODOP.ADD_PRINT_PDF(-30, 0, '100%', '100%', url);
    // LODOP.ADD_PRINT_PDF(0,0,"100%","100%","http://localhost:8000/CLodopDemos/PDFDemo.pdf");
    // LODOP.ADD_PRINT_PDF(-30,0,"100%","100%","e:\\AAA.pdf");
    LODOP.SET_PRINT_COPIES(physicalCopyCount);
    LODOP.PRINT();
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
}
