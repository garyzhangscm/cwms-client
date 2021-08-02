import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';

import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrderProducedInventory } from '../models/work-order-produced-inventory';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { WorkOrderService } from '../services/work-order.service';

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
  workOrderProduceTransaction!: WorkOrderProduceTransaction;
  consumeByBomQuantity = 'true';
  currentWorkOrder!: WorkOrder;
  findMatchedBOM = true;
  pageLoading = false;

  validInventoryStatuses: InventoryStatus[] = [];
  assignedProductionLines: ProductionLine[] = [];
  isCollapse = true;

  pageTitle: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private workOrderService: WorkOrderService,
    private billOfMaterialService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce');
  }

  ngOnInit(): void {
    this.pageLoading = true;
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
  setupEmptyWorkOrderProduceTransaction(workOrder: WorkOrder): void {
    this.billOfMaterialService.findMatchedBillOfMaterial(workOrder.id!).subscribe(bomRes => {
      if (bomRes != null) {
        this.findMatchedBOM = true;
        this.consumeByBomQuantity = 'true';
        this.workOrderProduceTransaction = {
          id: undefined,
          workOrder,
          workOrderLineConsumeTransactions: this.getEmptyWorkOrderLineConsumeTransactions(),
          workOrderProducedInventories: [this.getEmptyWorkOrderProducedInventory()],
          consumeByBomQuantity: true,
          matchedBillOfMaterial: bomRes,
          workOrderByProductProduceTransactions: [],
          workOrderKPITransactions: [],
          productionLine: undefined,
        };
        // hide the consume quantity table so by default we will 
        // consume by BOM
        this.isCollapse = true;
      } else {
        this.findMatchedBOM = false;
        this.consumeByBomQuantity = 'false';
        this.workOrderProduceTransaction = {
          id: undefined,
          workOrder,
          workOrderLineConsumeTransactions: this.getEmptyWorkOrderLineConsumeTransactions(),
          workOrderProducedInventories: [this.getEmptyWorkOrderProducedInventory()],
          consumeByBomQuantity: false,
          matchedBillOfMaterial: undefined,
          workOrderByProductProduceTransactions: [],
          workOrderKPITransactions: [],
          productionLine: undefined,
        };
        this.isCollapse = false;
      }

    });
  }

  getEmptyWorkOrderLineConsumeTransactions(): WorkOrderLineConsumeTransaction[] {
    const workOrderLineConsumeTransactions: WorkOrderLineConsumeTransaction[] = [];
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      const workOrderLineConsumeTransaction = {
        id: undefined,
        workOrderLine,
        consumedQuantity: 0,
      };
      workOrderLineConsumeTransactions.push(workOrderLineConsumeTransaction);
    });
    return workOrderLineConsumeTransactions;
  }
  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  addExtraInventory(): void {
    this.workOrderProduceTransaction.workOrderProducedInventories = [
      ...this.workOrderProduceTransaction.workOrderProducedInventories,
      this.getEmptyWorkOrderProducedInventory(),
    ];
  }

  lpnChanged(event: Event, inventory: Inventory): void {
    inventory.lpn = (event.target as HTMLInputElement).value;
  }

  generateLPN(checked: boolean, index: number, inventory: Inventory): void {
    if (checked) {
      this.inventoryService.getNextLPN().subscribe(nextId => {
        inventory.lpn = nextId;
      });
    }
  }

  itemPackageTypeChanged(itemPackageTypeName: string, workOrderProducedInventory: WorkOrderProducedInventory): void {
    // we should alraedy load the item information
    this.currentWorkOrder.item!.itemPackageTypes
      .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
      .forEach(itemPackageType => {
        workOrderProducedInventory.itemPackageType = itemPackageType;
        workOrderProducedInventory.itemPackageTypeId = itemPackageType.id!;
      });
  }

  inventoryStatusChanged(inventoryStatusId: number, workOrderProducedInventory: WorkOrderProducedInventory): void {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => {
        workOrderProducedInventory.inventoryStatus = inventoryStatus;
        workOrderProducedInventory.inventoryStatusId = inventoryStatus.id!;
      });
  }

  saveCurrentWorkOrderResults(): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }

  getEmptyWorkOrderProducedInventory(): WorkOrderProducedInventory {
    return {
      id: undefined,

      lpn: '',
      itemPackageTypeId: undefined,
      itemPackageType: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        description: '',
        name: '',
        itemUnitOfMeasures: [],
      },
      quantity: 0,
      inventoryStatusId: undefined,
      inventoryStatus: {
        id: undefined,
        name: '',
        description: '',
      },
    };
  }
  onConsumeByBomQuantityChanged(consumeByBomQuantity: string): void {
    this.consumeByBomQuantity = consumeByBomQuantity;
    this.workOrderProduceTransaction.consumeByBomQuantity = consumeByBomQuantity === 'true';
    this.isCollapse = this.workOrderProduceTransaction.consumeByBomQuantity;
  }

  produceByProduct(): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    this.router.navigateByUrl(`/work-order/work-order/produce/by-product?id=${this.currentWorkOrder.id}`);
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

  productionLineChanged(productionLineName: string) {
    console.log(`setup current work order produce transaction's production line to ${productionLineName}`);
    const productionLineAssignments: ProductionLineAssignment[] | undefined =
      this.currentWorkOrder.productionLineAssignments?.filter(
        productionLineAssignment => productionLineAssignment.productionLine.name === productionLineName
      );
    if (productionLineAssignments != undefined &&
      productionLineAssignments.length > 0) {

      this.workOrderProduceTransaction.productionLine = productionLineAssignments[0].productionLine;
      console.log(`set production line to ${this.workOrderProduceTransaction.productionLine.name}`);
    }
  }
}
