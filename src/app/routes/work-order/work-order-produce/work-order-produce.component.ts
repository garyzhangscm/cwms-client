import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Inventory } from '../../inventory/models/inventory';
import { WorkOrder } from '../models/work-order';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { AuditCountResultService } from '../../inventory/services/audit-count-result.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrderProducedInventory } from '../models/work-order-produced-inventory';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { BillOfMaterialService } from '../services/bill-of-material.service';

@Component({
  selector: 'app-work-order-work-order-produce',
  templateUrl: './work-order-produce.component.html',
  styles: [
    `
      nz-sider {
        background: transparent;
        text-align: left;
      }

      nz-content {
        background: transparent;
        text-align: right;
      }
    `,
  ],
})
export class WorkOrderWorkOrderProduceComponent implements OnInit {
  workOrderProduceTransaction: WorkOrderProduceTransaction;
  consumeByBomQuantity = 'true';
  currentWorkOrder: WorkOrder;
  findMatchedBOM = true;

  validInventoryStatuses: InventoryStatus[] = [];
  isCollapse = true;

  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
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
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.produce'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.workOrderService.getWorkOrder(params.id).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
          this.setupEmptyWorkOrderProduceTransaction(this.currentWorkOrder);
        });
      }
    });
    this.loadAvailableInventoryStatus();
  }
  setupEmptyWorkOrderProduceTransaction(workOrder: WorkOrder) {
    this.billOfMaterialService.findMatchedBillOfMaterial(workOrder.id).subscribe(bomRes => {
      if (bomRes != null) {
        this.findMatchedBOM = true;
        this.consumeByBomQuantity = 'true';
        this.workOrderProduceTransaction = {
          id: null,
          workOrder,
          workOrderLineConsumeTransactions: this.getEmptyWorkOrderLineConsumeTransactions(),
          workOrderProducedInventories: [this.getEmptyWorkOrderProducedInventory()],
          consumeByBomQuantity: true,
          matchedBillOfMaterial: bomRes,
          workOrderByProductProduceTransactions: [],
          workOrderKPITransactions: [],
        };
      } else {
        this.findMatchedBOM = false;
        this.consumeByBomQuantity = 'false';
        this.workOrderProduceTransaction = {
          id: null,
          workOrder,
          workOrderLineConsumeTransactions: this.getEmptyWorkOrderLineConsumeTransactions(),
          workOrderProducedInventories: [this.getEmptyWorkOrderProducedInventory()],
          consumeByBomQuantity: false,
          matchedBillOfMaterial: null,
          workOrderByProductProduceTransactions: [],
          workOrderKPITransactions: [],
        };
      }
    });
  }

  getEmptyWorkOrderLineConsumeTransactions(): WorkOrderLineConsumeTransaction[] {
    const workOrderLineConsumeTransactions: WorkOrderLineConsumeTransaction[] = [];
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      const workOrderLineConsumeTransaction = {
        id: null,
        workOrderLine,
        consumedQuantity: 0,
      };
      workOrderLineConsumeTransactions.push(workOrderLineConsumeTransaction);
    });
    return workOrderLineConsumeTransactions;
  }
  loadAvailableInventoryStatus() {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  addExtraInventory() {
    this.workOrderProduceTransaction.workOrderProducedInventories = [
      ...this.workOrderProduceTransaction.workOrderProducedInventories,
      this.getEmptyWorkOrderProducedInventory(),
    ];
  }

  lpnChanged(lpn: string, inventory: Inventory) {
    inventory.lpn = lpn;
  }

  generateLPN(checked: boolean, index: number, inventory: Inventory) {
    if (checked) {
      this.inventoryService.getNextLPN().subscribe(nextId => {
        inventory.lpn = nextId;
      });
    }
  }

  itemPackageTypeChanged(itemPackageTypeName: string, workOrderProducedInventory: WorkOrderProducedInventory) {
    // we should alraedy load the item information
    this.currentWorkOrder.item.itemPackageTypes
      .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
      .forEach(itemPackageType => {
        workOrderProducedInventory.itemPackageType = itemPackageType;
        workOrderProducedInventory.itemPackageTypeId = itemPackageType.id;
      });
  }

  inventoryStatusChanged(inventoryStatusId: number, workOrderProducedInventory: WorkOrderProducedInventory) {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => {
        workOrderProducedInventory.inventoryStatus = inventoryStatus;
        workOrderProducedInventory.inventoryStatusId = inventoryStatus.id;
      });
  }

  saveCurrentWorkOrderResults() {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }

  getEmptyWorkOrderProducedInventory(): WorkOrderProducedInventory {
    return {
      id: null,
      lpn: '',
      itemPackageTypeId: null,
      itemPackageType: {
        id: null,
        name: '',
        itemUnitOfMeasures: null,
      },
      quantity: 0,
      inventoryStatusId: null,
      inventoryStatus: {
        id: null,
        name: '',
        description: '',
      },
    };
  }
  onConsumeByBomQuantityChanged(consumeByBomQuantity) {
    this.consumeByBomQuantity = consumeByBomQuantity;
    this.workOrderProduceTransaction.consumeByBomQuantity = consumeByBomQuantity === 'true';
    this.isCollapse = this.workOrderProduceTransaction.consumeByBomQuantity;
  }

  produceByProduct() {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    this.router.navigateByUrl(`/work-order/work-order/produce/by-product?id=${this.currentWorkOrder.id}`);
  }

  onIndexChange(index: number) {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    switch (index) {
      case 0:
        this.router.navigateByUrl(`/work-order/work-order/produce?id=${this.workOrderProduceTransaction.workOrder.id}`);
        break;
      case 1:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/by-product?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
      case 2:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/kpi?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
      case 3:
        this.router.navigateByUrl(
          `/work-order/work-order/produce/confirm?id=${this.workOrderProduceTransaction.workOrder.id}`,
        );
        break;
    }
  }
}
