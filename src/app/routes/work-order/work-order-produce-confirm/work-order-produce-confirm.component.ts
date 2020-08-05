import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { WorkOrderService } from '../services/work-order.service';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';
import { NzMessageService } from 'ng-zorro-antd';

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
  workOrderProduceTransaction: WorkOrderProduceTransaction;

  isWorkOrderCollapse = true;

  savingInProcess = false;

  pageTitle: string;
  constructor(
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService,
    private i18n: I18NService,
    private titleService: TitleService,
    private workOrderService: WorkOrderService,
    private billOfMaterialService: BillOfMaterialService,
    private locationService: LocationService,
    private inventoryStatusService: InventoryStatusService,
    private itemService: ItemService,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce.confirm');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.produce.confirm'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction'));

    if (
      this.workOrderProduceTransaction.consumeByBomQuantity === true &&
      this.workOrderProduceTransaction.matchedBillOfMaterial !== null
    ) {
      this.setupWorkOrderConsumptionInformation();
    }
    this.savingInProcess = false;
  }
  setupWorkOrderConsumptionInformation() {
    let workOrderProducedQuantity = 0;
    this.workOrderProduceTransaction.workOrderProducedInventories.forEach(inventory => {
      workOrderProducedQuantity += inventory.quantity;
    });

    this.workOrderProduceTransaction.workOrderLineConsumeTransactions.forEach(workOrderLineConsumeTransaction => {
      const matchedBillOfMaterialLines = this.workOrderProduceTransaction.matchedBillOfMaterial.billOfMaterialLines.filter(
        billOfMaterialLine => billOfMaterialLine.itemId === workOrderLineConsumeTransaction.workOrderLine.itemId,
      );
      workOrderLineConsumeTransaction.consumedQuantity =
        (matchedBillOfMaterialLines[0].expectedQuantity * workOrderProducedQuantity) /
        this.workOrderProduceTransaction.matchedBillOfMaterial.expectedQuantity;
    });
  }
  toggleCollapse() {
    this.isWorkOrderCollapse = !this.isWorkOrderCollapse;
  }

  saveWorkOrderProduceResults() {
    this.savingInProcess = true;
    this.workOrderProduceTransactionService
      .saveWorkOrderProduceTransaction(this.workOrderProduceTransaction)
      .subscribe(workOrderProduceTransactionRes => {
        this.messageService.success(this.i18n.fanyi('message.work-order.produced-success'));
        setTimeout(() => {
          this.savingInProcess = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${workOrderProduceTransactionRes.workOrder.number}`);
        }, 2500);
      });
  }
}
