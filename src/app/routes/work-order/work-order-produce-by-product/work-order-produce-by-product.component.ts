import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrder } from '../models/work-order';
import { WorkOrderByProduct } from '../models/work-order-by-product';
import { WorkOrderByProductProduceTransaction } from '../models/work-order-by-product-produce-transaction';
import { WorkOrderLineConsumeTransaction } from '../models/work-order-line-consume-transaction';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { WorkOrderProducedInventory } from '../models/work-order-produced-inventory';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { WorkOrderService } from '../services/work-order.service';

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
  workOrderProduceTransaction!: WorkOrderProduceTransaction;
  currentWorkOrder!: WorkOrder;

  validInventoryStatuses: InventoryStatus[] = [];

  pageTitle: string;

  mapOfWorkOrderByProduct: { [key: string]: WorkOrderByProduct } = {};
  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private inventoryStatusService: InventoryStatusService,
    private inventoryService: InventoryService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('steps.work-order-produce.by-product.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('steps.work-order-produce.by-product.title'));

    this.workOrderProduceTransaction = JSON.parse(sessionStorage.getItem('currentWorkOrderProduceTransaction')!);
    this.currentWorkOrder = this.workOrderProduceTransaction.workOrder!;
    this.setupWorkOrderByProductMap();
    this.loadAvailableInventoryStatus();
  }
  setupWorkOrderByProductMap(): void {
    this.currentWorkOrder.workOrderByProducts.forEach(workOrderByProduct => {
      this.mapOfWorkOrderByProduct[workOrderByProduct.item!.name] = workOrderByProduct;
    });
  }
  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  addExtraInventory(): void {
    this.workOrderProduceTransaction.workOrderByProductProduceTransactions = [
      ...this.workOrderProduceTransaction.workOrderByProductProduceTransactions,
      this.getEmptyWorkOrderByProductProducedInventory(),
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

  itemPackageTypeChanged(
    itemPackageTypeName: string,
    workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction,
  ): void {
    // we should alraedy load the item information
    this.currentWorkOrder.item!.itemPackageTypes
      .filter(itemPackageType => itemPackageType.name === itemPackageTypeName)
      .forEach(itemPackageType => {
        workOrderByProductProduceTransaction.itemPackageType = itemPackageType;
        workOrderByProductProduceTransaction.itemPackageTypeId = itemPackageType.id!;
      });
  }

  inventoryStatusChanged(
    inventoryStatusId: number,
    workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction,
  ): void {
    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id === inventoryStatusId)
      .forEach(inventoryStatus => {
        workOrderByProductProduceTransaction.inventoryStatus = inventoryStatus;
        workOrderByProductProduceTransaction.inventoryStatusId = inventoryStatus.id!;
      });
  }

  saveCurrentWorkOrderResults(): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
  }

  getEmptyWorkOrderByProductProducedInventory(): WorkOrderByProductProduceTransaction {
    return {
      id: undefined,
      lpn: '',
      workOrderByProduct: undefined,
      itemPackageTypeId: undefined,
      itemPackageType: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        description: undefined,
        name: '',
        itemUnitOfMeasures: [],
      },
      quantity: 0,
      inventoryStatusId: undefined,
      inventoryStatus: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
      },

      locationId: undefined,
      location: undefined,
    };
  }

  itemChanged(itemName: string, workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction): void {
    console.log(`Item name changed to ${itemName}`);
    const workOrderByProduct = this.mapOfWorkOrderByProduct[itemName];
    console.log(`we got workOrderByProduct: ${JSON.stringify(workOrderByProduct)}`);
    workOrderByProductProduceTransaction.workOrderByProduct = workOrderByProduct;
  }

  addKPIInfo(): void {
    sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
    this.router.navigateByUrl(`/work-order/work-order/produce/kpi?id=${this.currentWorkOrder.id}`);
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
}
