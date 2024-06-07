import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { Receipt } from '../models/receipt';
import { ReceiptService } from '../services/receipt.service';

@Component({
  selector: 'app-inbound-printing-receiving-lpn-label',
  templateUrl: './printing-receiving-lpn-label.component.html',
})
export class InboundPrintingReceivingLpnLabelComponent implements OnInit {

  pageTitle: string;
  
  currentReceipt?: Receipt;
  startLPN: string = "";
  quantity: number = 0;
  labelCount: number = 0;
  isSpinning = false;
  userSpecifyLPN = false;
  ignoreInventoryQuantity = false;

  returnUrl = "";
  type = "";  
  documentFormat = "label";
  inventoryConfiguration?: InventoryConfiguration;
  
  lpnLableCountMap = new Map<number, number>();

  @ViewChild('receiptLineTable', { static: true })
  st!: STComponent;
  
  
  receiptLineTableColumns: STColumn[] = [];
  setupReceiptLineTableColumns() {

    this.receiptLineTableColumns = [ 
      { title: this.i18n.fanyi("receipt.line.number"), index: 'number', width: 150 },    
      {
        title: this.i18n.fanyi("item"), width: 150, 
        render: 'itemNameColumn', 
      },
      {
        title: this.i18n.fanyi("item.description"), width: 150, 
        render: 'itemDescriptionColumn', 
      }, 
      { title: this.i18n.fanyi("receipt.line.expectedQuantity"), 
      
          render: 'expectedQuantityColumn',  width: 150 },     
      { title: this.i18n.fanyi("receipt.line.receivedQuantity"),  render: 'receivedQuantityColumn',  width: 150 },    
      { title: this.i18n.fanyi("receipt.line.overReceivingQuantity"), index: 'overReceivingQuantity' , width: 150 },  
      { title: this.i18n.fanyi("receipt.line.overReceivingPercent"), index: 'overReceivingPercent' , width: 150 },         
      { title: this.i18n.fanyi("color"), index: 'color', width: 150 },  
        { title: this.i18n.fanyi("productSize"), index: 'productSize', width: 150 },  
        { title: this.i18n.fanyi("style"), index: 'style', width: 150 }, 
        { title: this.inventoryConfiguration?.inventoryAttribute1DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute1") : this.inventoryConfiguration?.inventoryAttribute1DisplayName,  
              index: 'inventoryAttribute1' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute1Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute2DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute2") : this.inventoryConfiguration?.inventoryAttribute2DisplayName,  
              index: 'inventoryAttribute2' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute2Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute3DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute3") : this.inventoryConfiguration?.inventoryAttribute3DisplayName,  
              index: 'inventoryAttribute3' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute3Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute4DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute4") : this.inventoryConfiguration?.inventoryAttribute4DisplayName,  
              index: 'inventoryAttribute4' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute4Enabled == true, width: 150  
        }, 
        { title: this.inventoryConfiguration?.inventoryAttribute5DisplayName == null ?
              this.i18n.fanyi("inventoryAttribute5") : this.inventoryConfiguration?.inventoryAttribute5DisplayName,  
              index: 'inventoryAttribute5' ,
            iif: () =>  this.inventoryConfiguration?.inventoryAttribute5Enabled == true, width: 150  
        }, 
        {
          title: this.i18n.fanyi("label-count"), 
          render: 'lableCountColumn', 
          width: 250,
          fixed: 'right', 
    
        },   
    
    ];
  }
   
  
  
  constructor(private http: _HttpClient,  
    private receiptService: ReceiptService,
    private activatedRoute: ActivatedRoute,    
    private titleService: TitleService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    private inventoryConfigurationService: InventoryConfigurationService,
    private router: Router, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,) { 
    
    this.pageTitle = this.i18n.fanyi('pre-print-lpn-label');
    
    inventoryConfigurationService.getInventoryConfigurations().subscribe({
      next: (inventoryConfigurationRes) => {
        if (inventoryConfigurationRes) { 
          this.inventoryConfiguration = inventoryConfigurationRes;
        } 
        this.setupReceiptLineTableColumns();
      } , 
      error: () =>  this.setupReceiptLineTableColumns()
    });
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('pre-print-lpn-label'));
    this.activatedRoute.queryParams.subscribe(params => {
      // we may pre-print lpn label for receipt or work order
      if (params.number) {

        this.isSpinning = true;
        this.receiptService.getReceipts(params.number, true).subscribe(
          {
            next:(receiptRes) => {
              if (receiptRes && receiptRes.length > 0) {

                this.currentReceipt = receiptRes[0];
              
                this.isSpinning = false;
                this.type="receipt-line";
                this.returnUrl = `/inbound/receipt?number=${this.currentReceipt.number}` 
                this.initLPNLabelCountForReceiptLines();
              }
            }
          }
        );
      }
    });
  } 

  initLPNLabelCountForReceiptLines() {
    
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
    
     
      if (this.documentFormat === 'report') {

        this.printReceivingLPNReportInBatch(event, startLPN, quantity, labelCount);
      }
      else {

        this.printReceivingLPNLabelInBatch(event, startLPN, quantity, labelCount);
      } 
  }
   
  printReceivingLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    /**
     * 
     * this.receiptLineService.generatePrePrintLPNLabelInBatch(
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
     * 
     */
    
  }
  printReceivingLPNReportInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    /**
     * 
     * this.receiptLineService.generatePrePrintLPNReportInBatch(
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
     * 
     */
    
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
/**
 * 
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
 * 
 * 
 */


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
 
        this.previewReceivingLPNLabelInBatch(event, startLPN, quantity, labelCount);  
  }
  

  previewReceivingLPNLabelInBatch(event: any, startLPN: string, quantity: number, labelCount: number) {
    
    this.isSpinning = true;
    /**
     * 
     * 
    this.receiptLineService.generatePrePrintLPNLabelInBatch(
      this.currentReceiptLine!.id!, startLPN, quantity, labelCount, 1, "", this.ignoreInventoryQuantity)
      .subscribe({
        next: (printResult) => {
          
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

            
        }, 
        error: () => this.isSpinning = false
      })

     * 
     */

  } 

  lpnLabelCountChanged(receiptLineId: number, lpnLabelCount: number) {
    this.lpnLableCountMap.set(receiptLineId, lpnLabelCount);
  }

}
