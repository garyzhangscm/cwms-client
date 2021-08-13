import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

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

  
  expandSet = new Set<number>(); 

  constructor(
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
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
        totalConsumedQuantity: 0,
        workOrderLineConsumeLPNTransactions: [],
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
    else {
      this.workOrderProduceTransaction.productionLine = undefined;
    }
  }
  
  loadNonpickedInventory(workOrderLineConsumeTransaction: WorkOrderLineConsumeTransaction) {

    // only when we have the production line selected
    if (this.workOrderProduceTransaction && this.workOrderProduceTransaction.productionLine) {
      // get the inventory in the inbound stage location 

      this.inventoryService.getInventoriesByLocationId(this.workOrderProduceTransaction.productionLine.inboundStageLocationId!)
          .subscribe({
            next: (inventories) => {
              // only find the inventories without a pick and match with the work order line's item
              let lpnList = new Map<string, number>();
              inventories.filter(inventory => inventory.pickId === undefined || inventory.pickId === null)
                  .filter(inventory => inventory.item!.id! === workOrderLineConsumeTransaction.workOrderLine!.itemId!)
                  .forEach(inventory =>
                      {
                        if (lpnList.has(inventory.lpn!)) {
                          let newQuantity = lpnList.get(inventory.lpn!)! + inventory.quantity!;
                          lpnList.set(inventory.lpn!, newQuantity);
                        }
                        else {
                          
                          lpnList.set(inventory.lpn!, inventory.quantity!);
                        }
                      }  
                  );
                  lpnList.forEach((value: number, key: string) => {
                    
                    console.log(`we found inventory ${key} / ${value}`)
                    workOrderLineConsumeTransaction.workOrderLineConsumeLPNTransactions?.push({
                      lpn: key,
                      quantity:value,
                      consumedQuantity: 0
                    })
                });
            }
          })
    }

  }
  
  onExpandChange(workOrderLineConsumeTransaction : WorkOrderLineConsumeTransaction, checked: boolean): void {

    if (checked) {
      this.expandSet.add(workOrderLineConsumeTransaction.workOrderLine!.id!); 
      console.log(`add ${workOrderLineConsumeTransaction.workOrderLine!.id!} to the expandset, now we have ${JSON.stringify(this.expandSet)}`);
      this.loadNonpickedInventory(workOrderLineConsumeTransaction);

    } else {
      this.expandSet.delete(workOrderLineConsumeTransaction.workOrderLine!.id!);
      console.log(`remove ${workOrderLineConsumeTransaction.workOrderLine!.id!} to the expandset, now we have ${JSON.stringify(this.expandSet)}`);
    }
  }
  recalculateTotalConsumedQuantity(workOrderLineConsumeTransaction: WorkOrderLineConsumeTransaction) {
    let totalConsumedQuantity = workOrderLineConsumeTransaction.consumedQuantity ?
        +workOrderLineConsumeTransaction.consumedQuantity : 0;
  
    let consumedLPNQuantity = workOrderLineConsumeTransaction.workOrderLineConsumeLPNTransactions?.map(
      workOrderLineConsumeLPNTransaction => +workOrderLineConsumeLPNTransaction.consumedQuantity
    ).reduce((a, b) => a + b, 0);
    if (consumedLPNQuantity) {
      totalConsumedQuantity += +consumedLPNQuantity;
    }
    if (workOrderLineConsumeTransaction.consumeFromWorkOrder && workOrderLineConsumeTransaction.consumeFromWorkOrderQuantity) {
      totalConsumedQuantity += +workOrderLineConsumeTransaction.consumeFromWorkOrderQuantity;
    }
    workOrderLineConsumeTransaction.totalConsumedQuantity = totalConsumedQuantity;


  }
}
