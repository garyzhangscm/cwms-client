import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';
import { WorkOrderService } from '../services/work-order.service';

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
})
export class WorkOrderWorkOrderProduceConfirmComponent implements OnInit {
  workOrderProduceTransaction!: WorkOrderProduceTransaction;

  isWorkOrderCollapse = true;
  isWorkOrderByProductCollapse = true;
  isWorkOrderKPICollapse = true;

  savingInProcess = false;
  isSpinning = false;

  pageTitle: string;
  
  expandSet = new Set<number>(); 

  constructor(
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce.confirm');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.produce.confirm'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction')!);

    this.setupWorkOrderConsumptionInformation(); 
    this.savingInProcess = false;
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
        setTimeout(() => {
          this.savingInProcess = false;
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${workOrderProduceTransactionRes.workOrder!.number}`);
        }, 2500);
      },
      error => {
        console.log(`error: ${JSON.stringify(error)}`);
        this.savingInProcess = false;
        this.isSpinning = false;
      },
    );
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
