import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { WalmartShippnigCartonLabel } from '../models/walmart-shipping-carton-labels';
import { OrderService } from '../services/order.service';
import { WalmartShippnigCartonLabelService } from '../services/walmart-shipping-carton-label.service';

@Component({
    selector: 'app-outbound-order-walmart-shipping-carton-label',
    templateUrl: './order-walmart-shipping-carton-label.component.html',
    standalone: false
})
export class OutboundOrderWalmartShippingCartonLabelComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentOrder?: Order;
  isSpinning = false;
  pageTitle = "";
  
  validItemNames = new Set<string>();
  selectedItemName = "";


  walmartShippingCartonLabels : WalmartShippnigCartonLabel[] = [];
  searchResult = "";


  @ViewChild('st', { static: true })
  walmartShippingCartonLabelTable!: STComponent;
  columns: STColumn[] = [
    { title: '', index: 'SSCC18', type: 'checkbox' , fixed: 'left',width: 75, },
    { title: this.i18n.fanyi("SSCC18"),  index: 'SSCC18',  fixed: 'left',width: 200,    }, 
    { title: this.i18n.fanyi("poNumber"),  index: 'poNumber'   }, 
    { title: this.i18n.fanyi("type"),  index: 'type'    }, 
    { title: this.i18n.fanyi("dept"),  index: 'dept'   }, 
    { title: this.i18n.fanyi("shipTo"),  index: 'shipTo'     }, 
    { title: this.i18n.fanyi("address1"),  index: 'address1'    }, 
    { title: this.i18n.fanyi("cityStateZip"),  index: 'cityStateZip'    }, 
    { title: this.i18n.fanyi("DC"),  index: 'DC'   }, 
    { title: this.i18n.fanyi("item.name"),  index: 'itemNumber'  }, 
    { title: this.i18n.fanyi("orderQuantity"),  index: 'orderQuantity'  }, 
    { title: this.i18n.fanyi("pieceCarton"),  index: 'pieceCarton'  }, 
    { title: this.i18n.fanyi("cartonQuantity"),  index: 'cartonQuantity'  },     
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
    private messageService: NzMessageService,
    private router: Router,
    private orderService: OrderService,
    private walmartShippnigCartonLabelService: WalmartShippnigCartonLabelService,
    private printingService: PrintingService,
    ) { 
    
    this.pageTitle = this.i18n.fanyi('walmart-shipping-carton-label');

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
            this.loadWalmartShippingLabel();
          });
      }
    });
  }
  loadWalmartShippingLabel() {
    if (this.currentOrder?.id != null) {

      this.isSpinning = true;
      this.orderService.getWalmartShippingCartonLabel(this.currentOrder.id!, this.selectedItemName, 
        false, false).subscribe({

        next: (walmartShippingCartonLabelRes) => {
          this.walmartShippingCartonLabels = walmartShippingCartonLabelRes;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: walmartShippingCartonLabelRes.length,
          });

          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      })
    }
  }

  
  printOrderWalmartShippingCartonLabel(event: any) {
    this.isSpinning = true;
    this.orderService.generateWalmartShippingCartonLabel(
      this.currentOrder!.id!, this.selectedItemName)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Walmart Shipping Carton Label",
            printResult.fileName,
            ReportType.WALMART_SHIPPING_CARTON_LABEL,
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
  
  printOrderWalmartShippingCartonLabelWithPalletLabel(event: any) {
    this.isSpinning = true;
    this.orderService.generateWalmartShippingCartonLabelWithPalletLabel(
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
                "Walmart Shipping Carton Label With Pallet Label",
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
            }
          );
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }

  previewWalmartShippingCartonLabel() {  

    this.isSpinning = true;
    this.orderService.generateWalmartShippingCartonLabelWithPalletLabel(
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
  
  printSingleWalmartShippingCartonLabel(event: any, walmartShippingCartonLabel: WalmartShippnigCartonLabel) {
    this.isSpinning = true;
    this.walmartShippnigCartonLabelService.generateWalmartShippingCartonLabels(
      walmartShippingCartonLabel.SSCC18)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Walmart Shipping Carton Label",
            printResult.fileName,
            ReportType.WALMART_SHIPPING_CARTON_LABEL,
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
  
  getSelectedWalmartShippingCartonLabel(): WalmartShippnigCartonLabel[] {
    let selectedWalmartShippnigCartonLabel: WalmartShippnigCartonLabel[] = [];
    
    const dataList: STData[] = this.walmartShippingCartonLabelTable.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedWalmartShippnigCartonLabel = [...selectedWalmartShippnigCartonLabel,
              ...this.walmartShippingCartonLabels.filter(
                walmartShippingCartonLabel => walmartShippingCartonLabel.SSCC18 == data["SSCC18"]
              )
          ]

        }
      );
    return selectedWalmartShippnigCartonLabel;
  }
  printSelectedWalmartShippingCartonLabel(event: any) {
    let selectedWalmartShippnigCartonLabel: WalmartShippnigCartonLabel[] = 
        this.getSelectedWalmartShippingCartonLabel();
    if (selectedWalmartShippnigCartonLabel == null || selectedWalmartShippnigCartonLabel.length == 0) {
      this.messageService.error("please select labels to print"); 
      return;
    }
    let SSCC18s = selectedWalmartShippnigCartonLabel.map(
      walmartShippingCartonLabel => walmartShippingCartonLabel.SSCC18
    ).join(",")
    this.walmartShippnigCartonLabelService.generateWalmartShippingCartonLabels(
      SSCC18s)
      .subscribe({
        next: (printResult) => {
          // send the result to the printer
          const printFileUrl
            = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
          console.log(`will print file: ${printFileUrl}`);
          this.printingService.printFileByName(
            "Walmart Shipping Carton Label",
            printResult.fileName,
            ReportType.WALMART_SHIPPING_CARTON_LABEL,
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

    this.loadWalmartShippingLabel();

  }
}
