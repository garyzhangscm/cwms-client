import { Injectable } from '@angular/core';
import { Lodop, LodopService } from '@delon/abc';
import { PrintPageOrientation } from '../models/print-page-orientation.enum';
import { PrintPageSize } from '../models/print-page-size.enum';
import { PrintableBarcode } from '../models/printable-barcode';

@Injectable({
  providedIn: 'root',
})
export class PrintingService {
  // printer related
  private lodop: Lodop | null = null;

  constructor(public lodopService: LodopService) {
    this.lodopService.cog.url = 'http://localhost:18000/CLodopfuncs.js';
    this.lodopService.lodop.subscribe(({ lodop, ok }) => {
      if (!ok) {
        console.log(`lodop error!`);
        return;
      }

      this.lodop = lodop as Lodop;
    });
  }

  print(
    name: string,
    pages: string[],
    pageOrientation: PrintPageOrientation = PrintPageOrientation.Portrait,
    pageSize: PrintPageSize = PrintPageSize.A4Small,
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

  getCucurrentPageBarcodes(barcodes: PrintableBarcode[], pageNumber: number): PrintableBarcode[]{
    return barcodes.filter(barcode => barcode.pageNumber === pageNumber);

  }

  addDefaultReportStyle(html: string): string{
    return `<style>
            h1, h2, h3, h4, h5, h6 {
              text-align:center
            }
            table {
              border-collapse: collapse;
              width: 100%
            }
            
            table, th, td {
              border: 1px solid black;
              text-align:center;
              padding: 15px;
            }
            </style>
            ${html}`;
  }

  getCurrentPageNumberHtml(pageNumber: number, pageCount: number): string {
    return `<div style="text-align: right">Page: ${pageNumber} / ${pageCount}</div>`;
  }
}
