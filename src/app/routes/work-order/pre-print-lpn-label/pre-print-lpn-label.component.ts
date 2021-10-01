import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReportType } from '../../report/models/report-type.enum';
import { WorkOrder } from '../models/work-order';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-pre-print-lpn-label',
  templateUrl: './pre-print-lpn-label.component.html',
})
export class WorkOrderPrePrintLpnLabelComponent implements OnInit {

  pageTitle: string;

  currentWorkOrder!: WorkOrder;
  startLPN: string = "";
  quantity: number = 0;
  labelCount: number = 0;
  isSpinning = false;
  
  constructor(private http: _HttpClient, 
    private workOrderService: WorkOrderService,
    private activatedRoute: ActivatedRoute,    
    private titleService: TitleService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
    
    this.pageTitle = this.i18n.fanyi('pre-print-lpn-label');
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('pre-print-lpn-label'));
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.workOrderId) {
        this.workOrderService.getWorkOrder(params.workOrderId).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
        });
      }
    });
  }
  printLPNLabels(event: any) {
    
    this.isSpinning = true;

    if (this.quantity > 0 && this.labelCount > 0) { 
        this.printLPNLabel(event, this.startLPN, this.quantity, this.labelCount); 

    }
    else {
      this.isSpinning = false;

    }
  }

  getNextLPNNumber(startLpn: string, index: number) : string{
    var number = startLpn.match(/\d+/g);
    // num[0] will be 21

    var prefixLetters =  startLpn.match(/[a-zA-Z]+/g);
    var nextNumber = (+number! + index).toString().padStart(startLpn.length - prefixLetters!.length, "0");
    return prefixLetters + nextNumber;
  }
  
  printLPNLabel(event: any, startLPN: string, quantity: number, remainingLabelCount: number) {
    if (remainingLabelCount === 0) {
      this.isSpinning = false;
      this.messageService.success(this.i18n.fanyi("report.print.printed"));
      return;
    }
    const lpn = this.getNextLPNNumber(startLPN, this.labelCount - remainingLabelCount);


    this.workOrderService.generatePrePrintLPNLabel(
      this.currentWorkOrder!.id!, lpn, quantity)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printRemoteFileByName(
            "Packing Slip",
            printResult.fileName,
            ReportType.PRODUCTION_LINE_ASSIGNMENT_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentWorkOrder!.number);
           
          this.printLPNLabel(event, startLPN, quantity, remainingLabelCount - 1);
        }, 
        error: () => this.isSpinning = false
      })
      
  }
  previewLPNLabel() {
    this.messageService.error(this.i18n.fanyi("action-not-support"));
  }

}
