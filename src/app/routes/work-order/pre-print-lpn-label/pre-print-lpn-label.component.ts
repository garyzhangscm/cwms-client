import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReceiptLine } from '../../inbound/models/receipt-line';
import { ReceiptLineService } from '../../inbound/services/receipt-line.service';
import { ReportType } from '../../report/models/report-type.enum';
import { SystemControlledNumberService } from '../../util/services/system-controlled-number.service';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-pre-print-lpn-label',
  templateUrl: './pre-print-lpn-label.component.html',
})
export class WorkOrderPrePrintLpnLabelComponent implements OnInit {

  pageTitle: string;

  currentProductionLineAssignment!: ProductionLineAssignment;
  currentWorkOrder?: WorkOrder;
  currentReceiptLine?: ReceiptLine;
  startLPN: string = "";
  quantity: number = 0;
  labelCount: number = 0;
  isSpinning = false;
  userSpecifyLPN = false;

  returnUrl = "";
  type = "";  
  
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
        this.productionLineAssignmentService.getProductionLineAssignment(params.productionLineAssignmentId)
            .subscribe(
              {
                next:(productionLineAssignmentRes) => {
                  this.currentProductionLineAssignment = productionLineAssignmentRes
                  this.isSpinning = false;
                  this.loadWorkOrder();
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
              this.returnUrl = `/inbound/receipt-maintenance?receiptNumber=${this.currentReceiptLine.receiptNumber}` 
            }
          }
        );
      }
    });
  }
  loadWorkOrder() {
    this.isSpinning = true;
    this.workOrderService.getWorkOrder(this.currentProductionLineAssignment.workOrderId!).subscribe({
      next:(workOrderRes) => {
        this.currentWorkOrder = workOrderRes;
        this.isSpinning = false;
        
        this.returnUrl = `/work-order/work-order?number=${this.currentWorkOrder.number}`

      }
    })
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
/*
  getNextLPNNumber(startLpn: string, index: number) : string{
    var number = startLpn.match(/\d+/g);
    // num[0] will be 21

    var prefixLetters =  startLpn.match(/[a-zA-Z]+/g);
    var nextNumber = (+number! + index).toString().padStart(startLpn.length - prefixLetters!.length, "0");
    return prefixLetters + nextNumber;
  }
  */
  printLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    
    
    if (this.type === "work-order") {

      this.printWorkOrderLPNLabelInBatch(event, startLPN, quantity, labelCount);
    }
    else if (this.type === "receipt-line") {
      this.printReceivingLPNLabelInBatch(event, startLPN, quantity, labelCount);
    }
  }
  
  printWorkOrderLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    this.workOrderService.generatePrePrintLPNLabelInBatch(
      this.currentWorkOrder!.id!, startLPN, quantity, labelCount, 
      this.currentProductionLineAssignment.productionLine.name, event.physicalCopyCount, event.printerName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printRemoteFileByName(
            "Work Order LPN Label",
            printResult.fileName,
            ReportType.PRODUCTION_LINE_ASSIGNMENT_LABEL,
            event.printerIndex,
            event.printerName,
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format 
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentProductionLineAssignment.productionLine.name);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  printReceivingLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    this.receiptLineService.generatePrePrintLPNLabelInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount, event.physicalCopyCount, event.printerName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printRemoteFileByName(
            "Receiving LPN Label",
            printResult.fileName,
            ReportType.RECEIVING_LPN_LABEL,
            event.printerIndex,
            event.printerName,
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentReceiptLine?.receiptNumber);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  /**
   *  
  printLPNLabel(event: any, startLPN: string, quantity: number, remainingLabelCount: number) {
    if (remainingLabelCount === 0) {
      this.isSpinning = false;
      this.messageService.success(this.i18n.fanyi("report.print.printed"));
      return;
    }
    
    let lpn = "";
    // if the user specify the lpn, then we will need to calculate from the LPN input by the user
    // otherwise, we will get the lpn from the parameters
    if (this.userSpecifyLPN) {
      lpn = this.getNextLPNNumber(startLPN, this.labelCount - remainingLabelCount);
    }
    else {
      lpn = startLPN;
    }

    console.log(`will print lpn label ${lpn}`)

    // if the user specify the quantity, we will print the quantity on the label.
    // otherwise, we will let the server side logic to decide which quantity will be printed on the label

    let lpnQuantity = quantity > 0 ? this.quantity : undefined;
    
    if (this.type === "work-order") {

      this.workOrderService.generatePrePrintLPNLabel(
        this.currentWorkOrder!.id!, lpn, lpnQuantity, this.currentProductionLineAssignment.productionLine.name)
        .subscribe({
          next: (printResult) => {
            // send the result to the printer
            const printFileUrl
              = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
            console.log(`will print file: ${printFileUrl}`);
            this.printingService.printRemoteFileByName(
              "Production Line Assignment Label",
              printResult.fileName,
              ReportType.PRODUCTION_LINE_ASSIGNMENT_LABEL,
              event.printerIndex,
              event.printerName,
              event.physicalCopyCount,
              PrintPageOrientation.Portrait,
              PrintPageSize.Letter,
              this.currentProductionLineAssignment.productionLine.name);
            if (remainingLabelCount === 1) {
              // ok, this is the last one, 
              this.isSpinning = false;
              this.messageService.success(this.i18n.fanyi("report.print.printed")); 
            }
            else {
  
              // if the user specify the start lpn, then we will recursively call the 
              // function by the same start lpn but reduce the remainingLabelCount parameter, 
              // which will be used to get the current LPN.
              // if we get the next lpn from the system, then we will get the next one again
              // and pass into the function so that the next round of this function will use 
              // it directly
              if (this.userSpecifyLPN) {
                this.printLPNLabel(event, startLPN, quantity, remainingLabelCount - 1);
              }
              else {
                
                this.systemControlledNumberService.getNextAvailableId(this.systemControlledNumberVariable).subscribe({
                  next: (nextNumber) => {
                    this.printLPNLabel(event, nextNumber, this.quantity, remainingLabelCount - 1); 
                  }
                })
              }
            }
          }, 
          error: () => this.isSpinning = false
        })
    }
    else if (this.type === "receipt-line") {
      
      this.receiptLineService.generatePrePrintLPNLabel(
        this.currentReceiptLine!.id!, lpn, lpnQuantity)
        .subscribe({
          next: (printResult) => {
            // send the result to the printer
            const printFileUrl
              = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
            console.log(`will print file: ${printFileUrl}`);
            this.printingService.printRemoteFileByName(
              "Receiving LPN Label",
              printResult.fileName,
              ReportType.RECEIVING_LPN_LABEL,
              event.printerIndex,
              event.printerName,
              event.physicalCopyCount,
              PrintPageOrientation.Portrait,
              PrintPageSize.Letter,
              this.currentReceiptLine?.receiptNumber);
            if (remainingLabelCount === 1) {
              // ok, this is the last one, 
              this.isSpinning = false;
              this.messageService.success(this.i18n.fanyi("report.print.printed")); 
            }
            else {
  
              // if the user specify the start lpn, then we will recursively call the 
              // function by the same start lpn but reduce the remainingLabelCount parameter, 
              // which will be used to get the current LPN.
              // if we get the next lpn from the system, then we will get the next one again
              // and pass into the function so that the next round of this function will use 
              // it directly
              if (this.userSpecifyLPN) {
                this.printLPNLabel(event, startLPN, quantity, remainingLabelCount - 1);
              }
              else {
                
                this.systemControlledNumberService.getNextAvailableId("work-order-lpn-number").subscribe({
                  next: (nextNumber) => {
                    this.printLPNLabel(event, nextNumber, this.quantity, remainingLabelCount - 1); 
                  }
                })
              }
            }
          }, 
          error: () => this.isSpinning = false
        })
    }
      
  }
   */
  previewLPNLabel() {
    this.messageService.error(this.i18n.fanyi("action-not-support"));
  }

}
