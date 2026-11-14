import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service'; 
import { PickWork } from '../../outbound/models/pick-work';
import { PickService } from '../../outbound/services/pick.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line'; 
import { WorkOrder } from '../models/work-order';
import { WorkOrderService } from '../services/work-order.service';

interface InventoryResult {
  inventory: Inventory;
  type: string;  // change , add , remove
  originalQuantity: number;
  newQuantity: number;
}

@Component({
    selector: 'app-work-order-deassign-production-line',
    templateUrl: './deassign-production-line.component.html',
    styleUrls: ['./deassign-production-line.component.less'],
    standalone: false
})
export class WorkOrderDeassignProductionLineComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentWorkOrder?: WorkOrder;
  pageTitle: string;
  selectedProductionLineId: number = -1;
  selectedProductionLine?: ProductionLine;
  listOfReturnableMaterial: Inventory[] = [];
  deliveredInventory: Inventory[] = [];
  inventoryResults: InventoryResult[] = [];
  picksToBeCancelled: PickWork[] = [];
  stepIndex = 0;
  validInventoryStatuses: InventoryStatus[] = [];
  isSpinning = false;

  constructor(private http: _HttpClient,

    private activatedRoute: ActivatedRoute,
    private workOrderService: WorkOrderService, 
    private inventoryStatusService: InventoryStatusService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
  ) {

    this.pageTitle = this.i18n.fanyi('menu.main.work-order.deassign-production-line');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['workOrderId']) {
        this.isSpinning = true;
        this.workOrderService.getWorkOrder(params['workOrderId']).subscribe({
          next: (workOrderRes) => {
            this.currentWorkOrder = workOrderRes
            this.isSpinning = false;
          },
          error: () => { },
        });

      }
    });
    this.loadAvailableInventoryStatus();
  }

  loadAvailableInventoryStatus(): void {
    if (this.validInventoryStatuses.length === 0) {
      this.inventoryStatusService
        .loadInventoryStatuses()
        .subscribe(inventoryStatuses => (this.validInventoryStatuses = inventoryStatuses));
    }
  }

  selectedProductionLineChanged() {
    console.log(`selectedProductionLineChanged: ${this.selectedProductionLineId}`);
    this.isSpinning = true;
    this.currentWorkOrder?.productionLineAssignments?.filter(
      productionLineAssignment =>
        productionLineAssignment.productionLine.id == this.selectedProductionLineId
    ).forEach(
      productionLineAssignment =>
        this.selectedProductionLine = productionLineAssignment.productionLine

    );

    console.log(`this.selectedProductionLine: ${JSON.stringify(this.selectedProductionLine)}`);
    // load the material that is not consumed yet
    this.loadReturnableMaterials();
    this.isSpinning = false;
  }

  loadReturnableMaterials() {

    this.workOrderService.getDeliveredInventory(this.currentWorkOrder!, this.selectedProductionLine)
      .subscribe({
        // all delivered inventory that still exists is available for return
        next: (deliveredInventoryRes) => {
          this.listOfReturnableMaterial = deliveredInventoryRes;
          this.deliveredInventory = deliveredInventoryRes;
        },
        error: () => { },

      });
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
    if (this.stepIndex === 1) {
      // display the result of inventory and picks
      // for confirmation
      this.displayResult();
    }
  }

  displayResult() {
    this.isSpinning = true;
    this.displayInventoryResult();
    this.displayPicksToBeCancelled();
    this.isSpinning = false;
  }
  displayInventoryResult() {

    this.inventoryResults = [];
    // for anything new, 
    this.listOfReturnableMaterial.filter(
      inventory => inventory.id === null || inventory.id === undefined
    ).forEach(
      inventory => this.inventoryResults = [...this.inventoryResults,
      {
        inventory: inventory,
        type: "add",
        originalQuantity: 0,
        newQuantity: inventory.quantity!

      }]
    );
    // for anything that already exists
    this.listOfReturnableMaterial.filter(
      inventory => inventory.id !== null && inventory.id !== undefined
    ).forEach(
      inventory => {
        const existingInventory = this.deliveredInventory.find(item => item.id == inventory.id);

        this.inventoryResults = [...this.inventoryResults,
        {
          inventory: inventory,
          type: "change",
          originalQuantity: existingInventory?.quantity!,
          newQuantity: inventory.quantity!

        }]
      }
    );

    // for anything that is to be removed
    this.deliveredInventory.filter(
      inventory => !this.listOfReturnableMaterial.some(returnableMaterial => returnableMaterial.id == inventory.id)
    ).forEach(
      inventory =>
        this.inventoryResults = [...this.inventoryResults,
        {
          inventory: inventory,
          type: "remove",
          originalQuantity: inventory.quantity!,
          newQuantity: 0,

        }]
    )


  }
  displayPicksToBeCancelled() {
    this.pickService.getPicksByWorkOrderAndProductionLine(this.currentWorkOrder!, this.selectedProductionLine!)
      .subscribe({

        next: (pickRes) => this.picksToBeCancelled = pickRes,
      });
  }

  confirm() {
    this.isSpinning = true;
    this.workOrderService.deassignProductionLine(
      this.currentWorkOrder!.id!, this.selectedProductionLine!, this.listOfReturnableMaterial
    ).subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/work-order/work-order?number=${this.currentWorkOrder?.number}`);
        }, 500);
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

  addExtraInventory(): void {
    this.listOfReturnableMaterial = [...this.listOfReturnableMaterial, this.getEmptyReturnableMaterial()];
  }

  getEmptyReturnableMaterial(): Inventory {
    return {
      id: undefined,
      lpn: '',
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      location: this.selectedProductionLine?.outboundStageLocation,
      virtual: false, // default to NON virtual inventory. It make no sense to adjust virtual inventory
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        allowCartonization: undefined,
        itemPackageTypes: [
          {
            id: undefined,
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
            description: '',
            name: '',
            itemUnitOfMeasures: [],
          },
        ],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      itemPackageType: {
        description: '',
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        itemUnitOfMeasures: [],
      },
      quantity: 0,
      inventoryStatus: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        name: '',
        description: '',
      },

    };
  }

  lpnChanged(event: Event, inventory: Inventory) {
    inventory.lpn = (event.target as HTMLInputElement).value;
  }
  itemChanged(inventory: Inventory) {


    this.currentWorkOrder?.workOrderLines.filter(
      workOrderLine => workOrderLine.item!.name == inventory.item?.name
    ).forEach(
      workOrderLine => inventory.item = workOrderLine.item
    )

  }
  itemPackageTypeChanged(inventory: Inventory) {

    inventory.item?.itemPackageTypes
      .filter(itemPackageType => itemPackageType.name === inventory.itemPackageType!.name)
      .forEach(itemPackageType => (inventory.itemPackageType = itemPackageType));

  }
  inventoryStatusChanged(inventory: Inventory) {

    this.validInventoryStatuses
      .filter(inventoryStatus => inventoryStatus.id == inventory.inventoryStatus!.id)
      .forEach(inventoryStatus => (inventory.inventoryStatus = inventoryStatus));

  }


}
