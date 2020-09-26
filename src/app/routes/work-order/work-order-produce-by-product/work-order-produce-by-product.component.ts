import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrder } from '../models/work-order';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { WorkOrderByProduct } from '../models/work-order-by-product';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { WorkOrderService } from '../services/work-order.service';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { Inventory } from '../../inventory/models/inventory';
import { WorkOrderProducedInventory } from '../models/work-order-produced-inventory';
import { WorkOrderByProductProduceTransaction } from '../models/work-order-by-product-produce-transaction';

@Component({
  selector: 'app-work-order-work-order-produce-by-product',
  templateUrl: './work-order-produce-by-product.component.html',
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
export class WorkOrderWorkOrderProduceByProductComponent implements OnInit {
  workOrderProduceTransaction: WorkOrderProduceTransaction;
  currentWorkOrder: WorkOrder;

  validInventoryStatuses: InventoryStatus[] = [];

  pageTitle: string;

  mapOfWorkOrderByProduct: { [key: string]: WorkOrderByProduct } = {};
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
    this.pageTitle = this.i18n.fanyi('steps.work-order-produce.by-product.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-produce.by-product.title'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction'));
    this.currentWorkOrder = this.workOrderProduceTransaction.workOrder;
    this.setupWorkOrderByProductMap();
    this.loadAvailableInventoryStatus();
  }
  setupWorkOrderByProductMap() {
    this.currentWorkOrder.workOrderByProducts.forEach(workOrderByProduct => {
      this.mapOfWorkOrderByProduct[workOrderByProduct.item.name] = workOrderByProduct;
    });
  }
  loadAvailableInventoryStatus() {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  addExtraInventory() {
    this.workOrderProduceTransaction.workOrderByProductProduceTransactions = [
      ...this.workOrderProduceTransaction.workOrderByProductProduceTransactions,
      this.getEmptyWorkOrderByProductProducedInventory(),
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

  itemPackageTypeChanged(
    itemPackageTypeName: string,
    workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction,
  ) {
    // we should alraedy load the item information
    this.currentWorkOrder.item.itemPackageTypes
      .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
      .forEach(itemPackageType => {
        workOrderByProductProduceTransaction.itemPackageType = itemPackageType;
        workOrderByProductProduceTransaction.itemPackageTypeId = itemPackageType.id;
      });
  }

  inventoryStatusChanged(
    inventoryStatusId: number,
    workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction,
  ) {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => {
        workOrderByProductProduceTransaction.inventoryStatus = inventoryStatus;
        workOrderByProductProduceTransaction.inventoryStatusId = inventoryStatus.id;
      });
  }

  saveCurrentWorkOrderResults() {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }

  getEmptyWorkOrderByProductProducedInventory(): WorkOrderByProductProduceTransaction {
    return {
      id: null,
      lpn: '',
      workOrderByProduct: null,
      itemPackageTypeId: null,
      itemPackageType: {
        id: null,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        description: null,
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

      locationId: null,
      location: null,
    };
  }

  itemChanged(itemName: string, workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction) {
    console.log(`Item name changed to ${itemName}`);
    const workOrderByProduct = this.mapOfWorkOrderByProduct[itemName];
    console.log(`we got workOrderByProduct: ${JSON.stringify(workOrderByProduct)}`);
    workOrderByProductProduceTransaction.workOrderByProduct = workOrderByProduct;
  }

  addKPIInfo() {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    this.router.navigateByUrl(`/work-order/work-order/produce/kpi?id=${this.currentWorkOrder.id}`);
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
