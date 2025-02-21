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
    standalone: false
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
    let workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction = {
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
    if (this.workOrderProduceTransaction.workOrder?.workOrderByProducts.length == 1 && 
      this.workOrderProduceTransaction.workOrder?.workOrderByProducts[0].item != null) {
      // there's only one work order by product, then we will fill in the item by default
      this.itemChanged(this.workOrderProduceTransaction.workOrder?.workOrderByProducts[0].item.name, 
        workOrderByProductProduceTransaction);
    }
    
    this.inventoryStatusService.getAvailableInventoryStatuses().subscribe(
      {
        next: (availableInventoryStatuses) => {
          if (availableInventoryStatuses.length > 0) {
            workOrderByProductProduceTransaction.inventoryStatusId = availableInventoryStatuses[0].id;
            workOrderByProductProduceTransaction.inventoryStatus = availableInventoryStatuses[0];
          }
        }
      }
    )

    return workOrderByProductProduceTransaction;
  }

  itemChanged(itemName: string, workOrderByProductProduceTransaction: WorkOrderByProductProduceTransaction): void {
    // console.log(`Item name changed to ${itemName}`);
    const workOrderByProduct = this.mapOfWorkOrderByProduct[itemName];
    // console.log(`we got workOrderByProduct: ${JSON.stringify(workOrderByProduct)}`);
    workOrderByProductProduceTransaction.workOrderByProduct = workOrderByProduct;

    // if the item only have one item package type, then fill in the default one
    if (workOrderByProduct.item != null) {
      if (workOrderByProduct.item.defaultItemPackageType != null) {

        workOrderByProductProduceTransaction.itemPackageTypeId = workOrderByProduct.item.defaultItemPackageType.id;
        workOrderByProductProduceTransaction.itemPackageType = workOrderByProduct.item.defaultItemPackageType;
      }
      else if (workOrderByProduct.item.itemPackageTypes.length == 1) {
        
        workOrderByProductProduceTransaction.itemPackageTypeId = workOrderByProduct.item.itemPackageTypes[0].id;
        workOrderByProductProduceTransaction.itemPackageType = workOrderByProduct.item.itemPackageTypes[0];
      }
    }
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

  
  removeByProductInventory(index: number) : void { 
    this.workOrderProduceTransaction.workOrderByProductProduceTransactions.splice(index, 1);

    // will need to expand the array and assign it back so it will refresh the table display
    this.workOrderProduceTransaction.workOrderByProductProduceTransactions = [
      ...this.workOrderProduceTransaction.workOrderByProductProduceTransactions]; 
  }
}
