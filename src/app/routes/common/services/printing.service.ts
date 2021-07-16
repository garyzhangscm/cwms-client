import { Injectable } from '@angular/core';
import { Lodop, LodopService } from '@delon/abc/lodop';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReportType } from '../../report/models/report-type.enum';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PrintPageOrientation } from '../models/print-page-orientation.enum';
import { PrintPageSize } from '../models/print-page-size.enum';
import { PrintableBarcode } from '../models/printable-barcode';

@Injectable({
  providedIn: 'root',
})
export class PrintingService {
  // printer related
  private lodop: Lodop | null = null;

  constructor(public lodopService: LodopService,
    private warehouseService: WarehouseService,
    private http: _HttpClient,
    private companyService: CompanyService) {
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

  getAllServerPrinters(): Observable<string[]> {

    const url = 'resource/printers';
    return this.http.get(url).pipe(map(res => res.data));
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

  printRemoteFileByName(
    name: string,
    fileName: string,
    type: ReportType,
    printerIndex: number,
    printerName: number,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
    findPrinterBy?: string
  ): void {



    let url = `${environment.SERVER_URL}/resource/report-histories/download`;

    url = `${url}/${this.warehouseService.getCurrentWarehouse().companyId}`;
    url = `${url}/${this.warehouseService.getCurrentWarehouse().id}`;
    url = `${url}/${type}`;
    url = `${url}/${fileName}`;

    if (this.warehouseService.getServerSidePrintingFlag()) {
      console.log(`will print from the server side`);
      url = `/resource/report-histories/print/${this.companyService.getCurrentCompany()?.id}/${this.warehouseService.getCurrentWarehouse().id}/${type}/${fileName}`
      if (findPrinterBy) {
        url = `${url}?findPrinterBy=${findPrinterBy}`;
      }
      if (printerName) {

        url = `${url}&printerName=${printerName}`;
      }
      this.http
        .post(url)
        .pipe(map(res => res.data)).subscribe(res => {
          console.log(` file printed!`);
        });

    }
    else {

      console.log(`will print from the client side`);
      this.printRemoteFileByPath(
        name,
        url,
        printerIndex,
        physicalCopyCount,
        pageOrientation,
        pageSize
      )
    }

  }


  printRemoteFileByPath(
    name: string,
    remoteFileUrl: string,
    printerIndex: number,
    physicalCopyCount: number,
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4,
  ): void {
    console.log(`start to print remote file in orientation: ${pageOrientation}`);
    console.log(`START TO PRINT ${remoteFileUrl}`);
    const LODOP = this.lodop!;
    //LODOP.PRINT_INITA(0, 0, 810, 610, name);
    LODOP.PRINT_INIT(name);
    LODOP.SET_PRINT_PAGESIZE(pageOrientation, 2100, 2970, pageSize);
    LODOP.SET_PRINTER_INDEX(printerIndex);
    LODOP.ADD_PRINT_PDF(-30, 0, "100%", "100%", remoteFileUrl);
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
        LODOP.ADD_PRINT_BARCODE(
          barcode.top, barcode.left,
          barcode.width, barcode.height,
          barcode.barCodeType, barcode.barCodeValue)
      );
      LODOP.ADD_PRINT_HTM(990, 0, '90%', '95%', this.getCurrentPageNumberHtml(index + 1, pages.length));

      // print page foot, which is always 
      if (index < pages.length - 1) { LODOP.NEWPAGE(); }
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
