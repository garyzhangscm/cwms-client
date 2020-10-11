import { Injectable } from '@angular/core';
import { Lodop, LodopService } from '@delon/abc';
import { PrintPageOrientation } from '../models/print-page-orientation.enum';
import { PrintPageSize } from '../models/print-page-size.enum';

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
    pageSize: PrintPageSize = PrintPageSize.A4,
  ) {
    const LODOP = this.lodop!;
    // Initial print task with task name
    LODOP.PRINT_INITA(10, 20, 810, 610, name);

    // LODOP.SET_PRINTER_INDEXA(this.printers['HP LaserJet 3055 PCL5']);
    // print from the default printer
    LODOP.SET_PRINTER_INDEXA(-1);

    // SET_PRINT_PAGESIZE(page-orientation, page-width, page-height, page-type)
    LODOP.SET_PRINT_PAGESIZE(pageOrientation, 0, 0, pageSize);

    pages.forEach((page, index) => {
      LODOP.ADD_PRINT_HTM(20, 10, '90%', '95%', this.addDefaultReportStyle(page));
      if (index < pages.length - 1) LODOP.NEWPAGE();
    });
    LODOP.PREVIEW();
    // LODOP.PRINT();
  }

  addDefaultReportStyle(html: string) {
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
              text-align:center
            }
            </style>
            ${html}`;
  }
}
