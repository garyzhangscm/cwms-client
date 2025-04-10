import { Component, inject, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service'; 
import { ReportType } from '../../report/models/report-type.enum'; 
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction'; 
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';
import { WorkOrderService } from '../services/work-order.service';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { RfService } from '../../util/services/rf.service';

@Component({
    selector: 'app-work-order-work-order-produce-confirm',
    templateUrl: './work-order-produce-confirm.component.html',
    styles: [
        `
      nz-card {
        margin-top: 10px;
        margin-bottom: 10px;
      }
    `,
    ],
    standalone: false
})
export class WorkOrderWorkOrderProduceConfirmComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  workOrderProduceTransaction!: WorkOrderProduceTransaction;

  isWorkOrderCollapse = true;
  isWorkOrderByProductCollapse = true;
  isWorkOrderKPICollapse = true;

  savingInProcess = false;
  isSpinning = false;

  pageTitle: string;
  
  expandSet = new Set<number>(); 

  printingStrategy = PrintingStrategy.SERVER_PRINTER;
  

  constructor(
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService,
    private titleService: TitleService,
    private router: Router,
    private messageService: NzMessageService,
    private workOrderService: WorkOrderService,
    private printingService: PrintingService,
    private inventoryService: InventoryService,
    private rfService: RfService,
    private warehouseConfigurationService: WarehouseConfigurationService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce.confirm');

    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfiguration) => {
          this.printingStrategy = warehouseConfiguration.printingStrategy ? 
                  warehouseConfiguration.printingStrategy:
                  PrintingStrategy.SERVER_PRINTER;
      }  
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.produce.confirm'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction')!);

    // skip all the transaction with 0 quantity
    this.removeZeroQuantity();

    this.setupWorkOrderConsumptionInformation(); 
    this.savingInProcess = false;
  }

  removeZeroQuantity() {
    this.workOrderProduceTransaction.workOrderProducedInventories = 
      this.workOrderProduceTransaction.workOrderProducedInventories.filter(
        workOrderProducedInventory => workOrderProducedInventory.quantity != null && workOrderProducedInventory.quantity > 0
      );
      this.workOrderProduceTransaction.workOrderByProductProduceTransactions = 
        this.workOrderProduceTransaction.workOrderByProductProduceTransactions.filter(
          byProduct => byProduct.quantity != null && byProduct.quantity > 0
        );
  }
  setupWorkOrderConsumptionInformation(): void {
    let workOrderProducedQuantity = 0;
    this.workOrderProduceTransaction.workOrderProducedInventories.forEach(inventory => {
      workOrderProducedQuantity += inventory.quantity!;
    });

    this.workOrderProduceTransaction.workOrderLineConsumeTransactions.forEach(
      workOrderLineConsumeTransaction => {
        if (this.workOrderProduceTransaction.consumeByBomQuantity) {
          // ok, we will consume by bom
          workOrderLineConsumeTransaction.consumedQuantity = 0;
          workOrderLineConsumeTransaction.consumingByLPNQuantity = 0;
          workOrderLineConsumeTransaction.consumingByWorkOrderQuantity = 0;
          workOrderLineConsumeTransaction.consumingByBomQuantity = 0; 

          if(this.workOrderProduceTransaction.consumeByBom?.id == null) {
            this.workOrderProduceTransaction.consumeByBom = undefined;
          }

          if (this.workOrderProduceTransaction.consumeByBom) {
            const matchedBillOfMaterialLines = this.workOrderProduceTransaction.consumeByBom!.billOfMaterialLines.filter(
              billOfMaterialLine => billOfMaterialLine.itemId === workOrderLineConsumeTransaction.workOrderLine!.itemId,
            );
            if (matchedBillOfMaterialLines.length > 0) {
              
              workOrderLineConsumeTransaction.consumingByBomQuantity = 
                (matchedBillOfMaterialLines[0].expectedQuantity! * workOrderProducedQuantity) /
                this.workOrderProduceTransaction.consumeByBom!.expectedQuantity!;
            }
          }
        }
        else {
          
          // ok, we will not consume by bom
          workOrderLineConsumeTransaction.consumingByBomQuantity = 0; 

          workOrderLineConsumeTransaction.consumingByLPNQuantity = 0;
          workOrderLineConsumeTransaction.consumingByWorkOrderQuantity = 0;
          
          
          // workOrderLineConsumeTransaction.consumedQuantity should be already setup 
          // manually by the user
          // workOrderLineConsumeTransaction.consumedQuantity = 0;

          workOrderLineConsumeTransaction.workOrderLineConsumeLPNTransactions?.filter(
            lpn => lpn && lpn.quantity > 0
          ).forEach(
            lpn => workOrderLineConsumeTransaction.consumingByLPNQuantity! += +lpn.quantity!
          );

          // TO-DO: Consume from other work order's finish goods is still under develop 
          // workOrderLineConsumeTransaction.consumingByWorkOrderQuantity = 0;
        }
        workOrderLineConsumeTransaction.totalConsumedQuantity = 
        
            +workOrderLineConsumeTransaction.consumedQuantity! + 
            +workOrderLineConsumeTransaction.consumingByLPNQuantity + 
            +workOrderLineConsumeTransaction.consumingByWorkOrderQuantity + 
            +workOrderLineConsumeTransaction.consumingByBomQuantity ;

      
    });
  }
  toggleCollapse(): void {
    this.isWorkOrderCollapse = !this.isWorkOrderCollapse;
  }
  toggleByProductCollapse(): void {
    this.isWorkOrderByProductCollapse = !this.isWorkOrderByProductCollapse;
  }
  toggleKPICollapse(): void {
    this.isWorkOrderKPICollapse = !this.isWorkOrderKPICollapse;
  }

  saveWorkOrderProduceResults(): void {
    
    this.savingInProcess = true;
    this.isSpinning = true;
    this.workOrderProduceTransactionService.saveWorkOrderProduceTransaction(this.workOrderProduceTransaction).subscribe(
      workOrderProduceTransactionRes => {
        this.messageService.success(this.i18n.fanyi('message.work-order.produced-success')); 

        /**
         * 
        if (this.workOrderProduceTransaction.printingNewLPNLabel == true 
            && this.workOrderProduceTransaction.labelPrinterName != ""
            && this.workOrderProduceTransaction.labelPrinterIndex != null
            && this.workOrderProduceTransaction.labelPrinterIndex > -1) {
          // we will print the lpn label for all lpns
          
          this.printNewLPNLabels(workOrderProduceTransactionRes);
        } 
         * 
         */ 
        console.log(`this.workOrderProduceTransaction.printingNewLPNLabel : ${this.workOrderProduceTransaction.printingNewLPNLabel}`);
        console.log(`this.printingStrategy : ${this.printingStrategy}`);
        if (this.workOrderProduceTransaction.printingNewLPNLabel == true  &&
              this.printingStrategy == PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) {
          // we will print the lpn label for all lpns
          console.log(`start to print lpn label from printer ${this.workOrderProduceTransaction.labelPrinterName}`);
          this.printNewLPNLabels(workOrderProduceTransactionRes, this.workOrderProduceTransaction.labelPrinterName); 
        } 
           
        setTimeout(() => {
          this.savingInProcess = false;
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${workOrderProduceTransactionRes.workOrder!.number}`);
        }, 500);
      },
      error => {
        console.log(`error: ${JSON.stringify(error)}`);
        this.savingInProcess = false;
        this.isSpinning = false;
      },
    );
  }
   
   
  printNewLPNLabels(workOrderProduceTransaction : WorkOrderProduceTransaction, printerName?: string) { 
    let lpnQuantityMap : Map<string, number> = new Map();
    // setup the LPN quantity map
    // add the produced inventory and by product to the map
    // so we can start to print the LPN
    workOrderProduceTransaction.workOrderProducedInventories.forEach(
      inventory => {
        let quantity = 0;
        if (lpnQuantityMap.has(inventory.lpn!)) {
          quantity = lpnQuantityMap.get(inventory.lpn!)!;
        }
        lpnQuantityMap.set(inventory.lpn!, quantity + inventory.quantity!);
      }
    );
    workOrderProduceTransaction.workOrderByProductProduceTransactions.forEach(
      inventory => {
        let quantity = 0;
        if (lpnQuantityMap.has(inventory.lpn!)) {
          quantity = lpnQuantityMap.get(inventory.lpn!)!;
        }
        lpnQuantityMap.set(inventory.lpn!, quantity + inventory.quantity!);
      }
    );
    lpnQuantityMap.forEach((value, key) => {
      // console.log(`(value, key): ${value}, ${key}`);
      // value : quantity
      // key: lpn
      
      console.log(`print for lpn ${key}, quantity ${value}`);
      
      this.workOrderService.generatePrePrintLPNLabelInBatch(
        workOrderProduceTransaction.workOrder!.id!, key, value, 1, 
        workOrderProduceTransaction.productionLine!.name, 1, 
        // this.workOrderProduceTransaction.labelPrinterName
        printerName)
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
              this.workOrderProduceTransaction.labelPrinterIndex,
              this.workOrderProduceTransaction.labelPrinterName,
              1, // event.physicalCopyCount,
              // 1, // we will always only print one copy. If the user want to print multiple copies
                  // the paramter will be passed into the 'generate' command instead of the print command
                  // so that we will have labels printed in uncollated format, not collated format 
              PrintPageOrientation.Portrait,
              PrintPageSize.Letter,
              workOrderProduceTransaction.productionLine!.name, 
              printResult, false);
            
              // this.isSpinning = false;
              //this.messageService.success(this.i18n.fanyi("report.print.printed"));
              
          }, 
          error: () => this.isSpinning = false
        })
    })
  }

  onIndexChange(index: number): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    switch (index) {
      case 0:
        this.router.navigateByUrl(`/work-order/work-order/produce?id=${this.workOrderProduceTransaction.workOrder!.id}`);
        break;
      case 1:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/by-product?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
      case 2:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/kpi?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
      case 3:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/confirm?id=${this.workOrderProduceTransaction.workOrder!.id}`,
        );
        break;
    }
  }
  
  onExpandChange(workOrderLineConsumeTransaction : WorkOrderLineConsumeTransaction, checked: boolean): void {

    if (checked) {
      this.expandSet.add(workOrderLineConsumeTransaction.workOrderLine!.id!); 
      console.log(`add ${workOrderLineConsumeTransaction.workOrderLine!.id!} to the expandset, now we have ${JSON.stringify(this.expandSet)}`);
      // this.loadNonpickedInventory(workOrderLineConsumeTransaction);

    } else {
      this.expandSet.delete(workOrderLineConsumeTransaction.workOrderLine!.id!);
      console.log(`remove ${workOrderLineConsumeTransaction.workOrderLine!.id!} to the expandset, now we have ${JSON.stringify(this.expandSet)}`);
    }
  }
}
