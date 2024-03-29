import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReportType } from '../../report/models/report-type.enum';
import { Order } from '../models/order';
import { WalmartShippnigCartonLabel } from '../models/walmart-shipping-carton-labels';
import { OrderService } from '../services/order.service';
import { WalmartShippnigCartonLabelService } from '../services/walmart-shipping-carton-label.service';

@Component({
  selector: 'app-outbound-order-walmart-shipping-carton-label',
  templateUrl: './order-walmart-shipping-carton-label.component.html',
})
export class OutboundOrderWalmartShippingCartonLabelComponent implements OnInit {

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
    { title: '', index: 'SSCC18', type: 'checkbox' },
    { title: this.i18n.fanyi("SSCC18"),  index: 'SSCC18'   }, 
    { title: this.i18n.fanyi("type"),  index: 'type'    }, 
    { title: this.i18n.fanyi("dept"),  index: 'dept'   }, 
    { title: this.i18n.fanyi("shipTo"),  index: 'shipTo'     }, 
    { title: this.i18n.fanyi("address1"),  index: 'address1'    }, 
    { title: this.i18n.fanyi("cityStateZip"),  index: 'cityStateZip'    }, 
    { title: this.i18n.fanyi("DC"),  index: 'DC'   }, 
    { title: this.i18n.fanyi("itemNumber"),  index: 'itemNumber'  }, 
    { title: this.i18n.fanyi("orderQuantity"),  index: 'orderQuantity'  }, 
    { title: this.i18n.fanyi("pieceCarton"),  index: 'cartonQuantity'  }, 
    { title: this.i18n.fanyi("cartonQuantity"),  index: 'itemName'  },    
    {
      title: this.i18n.fanyi("action"),  
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
      render: 'actionColumn',
    },  
    
  ]; 

  constructor(private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
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
      this.orderService.getWalmartShippingCartonLabel(this.currentOrder.id!, this.selectedItemName).subscribe({

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
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult);
          
            this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
            
        }, 
        error: () => this.isSpinning = false
      })
  }
  
  previewWalmartShippingCartonLabel() { 
      this.messageService.error(this.i18n.fanyi("action-not-support")); 
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
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult);
          
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
            // event.physicalCopyCount,
            1, // we will always only print one copy. If the user want to print multiple copies
                // the paramter will be passed into the 'generate' command instead of the print command
                // so that we will have labels printed in uncollated format, not collated format
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            this.currentOrder?.number, 
            printResult);
          
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
