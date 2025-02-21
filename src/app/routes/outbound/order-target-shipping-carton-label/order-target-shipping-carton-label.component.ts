import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { Order } from '../models/order';
import { TargetShippnigCartonLabel } from '../models/target-shipping-carton-labels';
import { WalmartShippnigCartonLabel } from '../models/walmart-shipping-carton-labels';
import { OrderService } from '../services/order.service';
import { TargetShippnigCartonLabelService } from '../services/target-shipping-carton-label.service';

@Component({
    selector: 'app-outbound-order-target-shipping-carton-label',
    templateUrl: './order-target-shipping-carton-label.component.html',
    standalone: false
})
export class OutboundOrderTargetShippingCartonLabelComponent implements OnInit {

  currentOrder?: Order;
  isSpinning = false;
  pageTitle = "";
  
  validItemNames = new Set<string>();
  selectedItemName = "";
 

  targetShippingCartonLabels : TargetShippnigCartonLabel[] = [];
  searchResult = "";


  @ViewChild('st', { static: false })
  targetShippingCartonLabelTable!: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'SSCC18', type: 'checkbox' , fixed: 'left',width: 75, },
    { title: this.i18n.fanyi("SSCC18"),  index: 'SSCC18',  fixed: 'left',width: 200,    }, 
    { title: this.i18n.fanyi("poNumber"),  index: 'poNumber'   }, 
    { title: this.i18n.fanyi("shipTo"),  index: 'shipTo'     }, 
    { title: this.i18n.fanyi("address1"),  index: 'address1'    }, 
    { title: this.i18n.fanyi("cityStateZip"),  index: 'cityStateZip'    }, 
    { title: this.i18n.fanyi("item.name"),  index: 'itemNumber'  }, 
    { title: this.i18n.fanyi("orderQuantity"),  index: 'orderQuantity'  }, 
    { title: this.i18n.fanyi("shippedQuantity"),  index: 'shippedQuantity'  }, 
    { title: this.i18n.fanyi("pieceCarton"),  index: 'pieceCarton'  },    
    {
      title: this.i18n.fanyi("lastPrintTime"),   
      render: 'lastPrintTimeColumn',
    },  
    { title: this.i18n.fanyi("palletPickLabel"),  index: 'palletPickLabelContent.number'  },    
    {
      title: this.i18n.fanyi("action"),   fixed: 'right',width: 150, 
      render: 'actionColumn',
    },  
    
  ]; 

  constructor( private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private router: Router,
    private orderService: OrderService,
    private targetShippnigCartonLabelService: TargetShippnigCartonLabelService,
    private printingService: PrintingService,
    ) { 
    
    this.pageTitle = this.i18n.fanyi('target-shipping-carton-label');

  }

  ngOnInit(): void { 
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.orderService.getOrder(params.id)
          .subscribe(orderRes => {
            this.currentOrder = orderRes;  
            this.currentOrder.orderLines.forEach(
              orderLine => this.validItemNames.add(orderLine.item!.name)
            );
            this.loadTargetShippingLabel();
          });
      }
    });
  }
  loadTargetShippingLabel() {
    if (this.currentOrder?.id != null) {

      this.isSpinning = true;
      this.orderService.getTargetShippingCartonLabel(this.currentOrder.id!, this.selectedItemName, 
        false, false).subscribe({

        next: (targetShippingCartonLabelRes) => {
          this.targetShippingCartonLabels = targetShippingCartonLabelRes;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: targetShippingCartonLabelRes.length,
          });

          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      })
    }
  }

  
  printOrderTargetShippingCartonLabel(event: any) {
    this.isSpinning = true;
    this.orderService.generateTargetShippingCartonLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Target Shipping Carton Label",
            printResult.fileName,
            ReportType.TARGET_SHIPPING_CARTON_LABEL,
            event.printerIndex,
            event.printerName,
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  
  printOrderTargetShippingCartonLabelWithPalletLabel(event: any) {
    this.isSpinning = true;
    this.orderService.generateTargetShippingCartonLabelWithPalletLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResults) => {
          // Note the return may contains a list of label files, we will need to print each one of them
          printResults.forEach(
            printResult => {

              // send the result to the printer
              const printFileUrl
                = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
              console.log(`will print file: ${printFileUrl}`);
              this.printingService.printFileByName(
                "Target Shipping Carton Label With Pallet Label",
                printResult.fileName,
                // ReportType.WALMART_SHIPPING_CARTON_LABEL,
                printResult.type,
                event.printerIndex,
                event.printerName,
                // event.physicalCopyCount,
                1, // we will always only print one copy. If the user want to print multiple copies
                    // the paramter will be passed into the 'generate' command instead of the print command
                    // so that we will have labels printed in uncollated format, not collated format
                PrintPageOrientation.Portrait,
                PrintPageSize.Letter,
                this.currentOrder?.number, 
                printResult, event.collated);
            }
          );
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  printCombinedOrderTargetShippingCartonLabelWithPalletLabel(event: any) {
    this.isSpinning = true;
    this.orderService.generateCombinedTargetShippingCartonLabelWithPalletLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResult) => { 

              // send the result to the printer
              const printFileUrl
                = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
              console.log(`will print file: ${printFileUrl}`);
              this.printingService.printFileByName(
                "Target Shipping Carton Label With Pallet Label",
                printResult.fileName,
                // ReportType.WALMART_SHIPPING_CARTON_LABEL,
                printResult.type,
                event.printerIndex,
                event.printerName,
                event.physicalCopyCount,
                //1, // we will always only print one copy. If the user want to print multiple copies
                    // the paramter will be passed into the 'generate' command instead of the print command
                    // so that we will have labels printed in uncollated format, not collated format
                PrintPageOrientation.Portrait,
                PrintPageSize.Letter,
                this.currentOrder?.number, 
                printResult, event.collated); 

            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }

  previewOrderTargetShippingCartonLabel() {  

    this.isSpinning = true;
    this.orderService.generateTargetShippingCartonLabelWithPalletLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResults) => {
          // Note the return may contains a list of label files, we will need to print each one of them
          printResults.forEach(
            printResult => { 
              // open each label in a new window
              window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 
  
                
            }
          );
          this.isSpinning = false; 
            
        }, 
        error: () => this.isSpinning = false
      });
  }
  
  previewCombinedOrderTargetShippingCartonLabel() {  

    this.isSpinning = true;
    this.orderService.generateCombinedTargetShippingCartonLabelWithPalletLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResult) => { 
              
          // open each label in a new window
          window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 
  
                 
          this.isSpinning = false; 
            
        }, 
        error: () => this.isSpinning = false
      });
  }
  
  printSingleTargetShippingCartonLabel(event: any, targetShippingCartonLabel: TargetShippnigCartonLabel) {
    this.isSpinning = true;
    this.targetShippnigCartonLabelService.generateTargetShippingCartonLabels(
      targetShippingCartonLabel.SSCC18)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Target Shipping Carton Label",
            printResult.fileName,
            ReportType.TARGET_SHIPPING_CARTON_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            //1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  
  getSelectedTargetShippingCartonLabel(): TargetShippnigCartonLabel[] {
    let selectedTargetShippnigCartonLabel: TargetShippnigCartonLabel[] = [];
    
    const dataList: STData[] = this.targetShippingCartonLabelTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedTargetShippnigCartonLabel = [...selectedTargetShippnigCartonLabel,
              ...this.targetShippingCartonLabels.filter(
                targetShippingCartonLabel => targetShippingCartonLabel.SSCC18 == data["SSCC18"]
              )
          ]

        }
      );
    return selectedTargetShippnigCartonLabel;
  }
  printSelectedTargetShippingCartonLabel(event: any) {
    let selectedTargetShippnigCartonLabel: TargetShippnigCartonLabel[] = 
        this.getSelectedTargetShippingCartonLabel();
    if (selectedTargetShippnigCartonLabel == null || selectedTargetShippnigCartonLabel.length == 0) {
      this.messageService.error("please select labels to print"); 
      return;
    }
    let SSCC18s = selectedTargetShippnigCartonLabel.map(
      targetShippingCartonLabel => targetShippingCartonLabel.SSCC18
    ).join(",")
    this.targetShippnigCartonLabelService.generateTargetShippingCartonLabels(
      SSCC18s)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Target Shipping Carton Label",
            printResult.fileName,
            ReportType.TARGET_SHIPPING_CARTON_LABEL,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            //1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult, event.collated);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  selectedItemNameChanged() {

    this.loadTargetShippingLabel();

  }

  removeSelectedLabels() {
    const labels = this.getSelectedLabels();
    if (labels == null || labels.length == 0) {
      this.messageService.error("No labels are selected");
      return;
    }
    const labelIds =labels.map(label => label.id?.toString()).join(",");
    this.isSpinning = true;
    this.targetShippnigCartonLabelService.removeTargetShippingCartonLabels(labelIds)
    .subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        this.loadTargetShippingLabel();

      },
      error: () => {
        this.isSpinning = false;
      }
    })

  }
  getSelectedLabels(): TargetShippnigCartonLabel[] {
    
    const dataList: STData[] = this.targetShippingCartonLabelTable.list;
    let selectedLabels: TargetShippnigCartonLabel[] = [];
    dataList.filter(record => record.checked === true)
    .forEach(record => {
      selectedLabels = [...selectedLabels, 
          ...this.targetShippingCartonLabels.filter(label => label.SSCC18 === record["SSCC18"])];
    });
    return selectedLabels;

  }

}
