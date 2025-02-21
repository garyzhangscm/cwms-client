import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReceiptLine } from '../../inbound/models/receipt-line';
import { ReceiptLineService } from '../../inbound/services/receipt-line.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum'; 
import { ProductionLineAssignment } from '../models/production-line-assignment'; 
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-pre-print-lpn-label',
    templateUrl: './pre-print-lpn-label.component.html',
    standalone: false
})
export class WorkOrderPrePrintLpnLabelComponent implements OnInit {

  pageTitle: string;

  currentProductionLineAssignment!: ProductionLineAssignment;
  // currentWorkOrder?: WorkOrder;
  currentReceiptLine?: ReceiptLine;
  startLPN: string = "";
  quantity: number = 0;
  labelCount: number = 0;
  isSpinning = false;
  userSpecifyLPN = false;
  ignoreInventoryQuantity = false;

  returnUrl = "";
  type = "";  
  documentFormat = "label";
  
  constructor(private http: _HttpClient, 
    private workOrderService: WorkOrderService,
    private productionLineAssignmentService: ProductionLineAssignmentService,
    private receiptLineService: ReceiptLineService,
    private activatedRoute: ActivatedRoute,    
    private titleService: TitleService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    private router: Router, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
    
    this.pageTitle = this.i18n.fanyi('pre-print-lpn-label');
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('pre-print-lpn-label'));
    this.activatedRoute.queryParams.subscribe(params => {
      // we may pre-print lpn label for receipt or work order
      if (params.productionLineAssignmentId) {
        this.isSpinning = true;
        this.productionLineAssignmentService.getProductionLineAssignment(params.productionLineAssignmentId, false)
            .subscribe(
              {
                next:(productionLineAssignmentRes) => {
                  this.currentProductionLineAssignment = productionLineAssignmentRes
                  this.isSpinning = false;
                  // this.loadWorkOrder();
                  this.type="work-order"; 
                }
              }
            );
      }
      else if (params.receiptLineId) {

        this.isSpinning = true;
        this.receiptLineService.getReceiptLine(params.receiptLineId).subscribe(
          {
            next:(receiptLineRes) => {
              this.currentReceiptLine = receiptLineRes;
              
              this.isSpinning = false;
              this.type="receipt-line";
              this.returnUrl = `/inbound/receipt?number=${this.currentReceiptLine.receiptNumber}` 
            }
          }
        );
      }
    });
  } 
  return(): void {
    this.router.navigateByUrl(this.returnUrl);
  }
  printLPNLabels(event: any) {
    
    this.isSpinning = true;
    if (this.labelCount === 0) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }

    if (this.userSpecifyLPN) {
      this.printByUserSpecifiedLPN(event);
    }
    else {
      this.printBySystemGeneratedLPN(event);
    }
  }
  printByUserSpecifiedLPN(event: any) {
    // make sure the user specify a start LPN
    if (!this.startLPN) {
      this.messageService.error(this.i18n.fanyi("ERROR-NEW-LPN-REQUIRED"))
      this.isSpinning = false;  
      return;
    }
    this.printLPNLabelInBatch(event, this.startLPN, this.quantity, this.labelCount); 

  }
  printBySystemGeneratedLPN(event: any) {

    this.printLPNLabelInBatch(event, "", this.quantity, this.labelCount);
     
  }  
  printLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    
    
    if (this.type === "work-order") {

      this.printWorkOrderLPNLabelInBatch(event, startLPN, quantity, labelCount);
    }
    else if (this.type === "receipt-line") {
      if (this.documentFormat === 'report') {

        this.printReceivingLPNReportInBatch(event, startLPN, quantity, labelCount);
      }
      else {

        this.printReceivingLPNLabelInBatch(event, startLPN, quantity, labelCount);
      }
    }
  }
  
  printWorkOrderLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    this.workOrderService.generatePrePrintLPNLabelInBatch(
      this.currentProductionLineAssignment.workOrderId!, startLPN, quantity, labelCount, 
      this.currentProductionLineAssignment.productionLineName, 
      1, //event.physicalCopyCount, 
      event.printerName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          // const printFileUrl
          //  = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          // console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Work Order LPN Label",
            printResult.fileName,
            ReportType.PRODUCTION_LINE_ASSIGNMENT_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            //1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format 
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentProductionLineAssignment.productionLineName, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  printReceivingLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    this.receiptLineService.generatePrePrintLPNLabelInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount, 
      1, // event.physicalCopyCount, 
      event.printerName, this.ignoreInventoryQuantity)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          // const printFileUrl
          //  = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          // console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Receiving LPN Label",
            printResult.fileName,
            ReportType.RECEIVING_LPN_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            // 1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentReceiptLine?.receiptNumber, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  printReceivingLPNReportInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    this.receiptLineService.generatePrePrintLPNReportInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount,
      1, // event.physicalCopyCount, 
      event.printerName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          // const printFileUrl
          //  = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          // console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Receiving LPN Report",
            printResult.fileName,
            ReportType.RECEIVING_LPN_REPORT,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            // 1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentReceiptLine?.receiptNumber, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  
  previewLPNs(event: any) {
    // preview label is not support
    if (this.documentFormat === 'label') {

      this.previewLPNLabel(event);
    }
    else {
      this.previewLPNReport();
    }
  }
  
  previewLPNReport() { 
    this.isSpinning = true; 
    if (this.labelCount === 0) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }

    this.receiptLineService.generatePrePrintLPNReportInBatch(
      this.currentReceiptLine!.id!, this.startLPN, this.quantity, this.labelCount)
      .subscribe(printResult => {
        this.isSpinning = false;
        sessionStorage.setItem("report_previous_page", `work-order/pre-print-lpn-label?receiptLineId=${this.currentReceiptLine?.id}`);
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },

      );


  }
  
  
  previewLPNLabel(event: any) {
    
    this.isSpinning = true;
    if (this.labelCount === 0) {
      
      this.messageService.error(this.i18n.fanyi("Label Count needs to be bigger than 0"));
      this.isSpinning = false;
  
      return;
    }

    if (this.userSpecifyLPN) {
      this.previewByUserSpecifiedLPN(event);
    }
    else {
      this.previewBySystemGeneratedLPN(event);
    }
  }
  
  previewByUserSpecifiedLPN(event: any) {
    // make sure the user specify a start LPN
    if (!this.startLPN) {
      this.messageService.error(this.i18n.fanyi("ERROR-NEW-LPN-REQUIRED"))
      this.isSpinning = false;  
      return;
    }
    this.previewLPNLabelInBatch(event, this.startLPN, this.quantity, this.labelCount); 

  }
  previewBySystemGeneratedLPN(event: any) {

    this.previewLPNLabelInBatch(event, "", this.quantity, this.labelCount);
     
  } 
  
  previewLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {

    if (this.type === "work-order") {

      this.previewWorkOrderLPNLabelInBatch(event, startLPN, quantity, labelCount);
    }
    else if (this.type === "receipt-line") {  
  
        this.previewReceivingLPNLabelInBatch(event, startLPN, quantity, labelCount); 
    }
  }
  

  previewReceivingLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    
    this.isSpinning = true;
    this.receiptLineService.generatePrePrintLPNLabelInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount, 1, "", this.ignoreInventoryQuantity)
      .subscribe({
        next: (printResult) => {
          
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

            
        }, 
        error: () => this.isSpinning = false
      })


  }
  
  previewWorkOrderLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    
    this.isSpinning = true;
    this.workOrderService.generatePrePrintLPNLabelInBatch(
      this.currentProductionLineAssignment.workOrderId!, startLPN, quantity, labelCount, 
      this.currentProductionLineAssignment.productionLineName,  1, "")
      .subscribe({
        next: (printResult) => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);
 
            
        }, 
        error: () => this.isSpinning = false
      })


  }

}
