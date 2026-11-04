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
  materialsReady = false;
  picksReady = false;
  loadError = '';
  private selectionVersion = 0;

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
          error: () => { this.isSpinning = false; this.messageService.error("Could not load the work order. Reload to retry."); },
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
    const version = ++this.selectionVersion;
    this.materialsReady = this.picksReady = false;
    this.loadError = '';
    this.stepIndex = 0;
    this.deliveredInventory = [];
    this.listOfReturnableMaterial = [];
    this.picksToBeCancelled = [];
    this.selectedProductionLine = this.currentWorkOrder?.productionLineAssignments?.find(
      a => a.productionLine.id == this.selectedProductionLineId
    )?.productionLine;
    this.isSpinning = !!this.selectedProductionLine;
    if (!this.selectedProductionLine || !this.currentWorkOrder) return;
    const failed = () => {
      if (version !== this.selectionVersion) return;
      this.loadError = 'Could not load returnable inventory. Retry before continuing.';
      this.isSpinning = false;
    };
    this.workOrderService.getDeliveredInventory(this.currentWorkOrder, this.selectedProductionLine).subscribe({
      next: rows => {
        if (version !== this.selectionVersion) return;
        if (!Array.isArray(rows)) { failed(); return; }
        this.deliveredInventory = rows;
        this.listOfReturnableMaterial = rows.map(row => ({ ...row }));
        this.materialsReady = true;
        this.isSpinning = false;
      }, error: failed
    });
  }

  previousStep(): void {
    if (this.isSpinning) return;
    this.picksReady = false;
    this.stepIndex = 0;
  }

  nextStep(): void {
    if (!this.materialsReady || this.isSpinning || this.stepIndex !== 0) return;
    this.isSpinning = true;
    this.picksReady = false;
    this.loadError = '';
    this.displayInventoryResult();
    const version = this.selectionVersion;
    const failed = () => {
      if (version !== this.selectionVersion) return;
      this.isSpinning = false;
      this.loadError = 'Could not load picks to cancel. Retry before continuing.';
    };
    this.pickService.getPicksByWorkOrderAndProductionLine(this.currentWorkOrder!, this.selectedProductionLine!).subscribe({
      next: rows => {
        if (version !== this.selectionVersion) return;
        if (!Array.isArray(rows)) { failed(); return; }
        this.picksToBeCancelled = rows;
        this.picksReady = true;
        this.stepIndex = 1;
        this.isSpinning = false;
      }, error: failed
    });
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
  confirm() {
    if (this.stepIndex !== 1 || !this.materialsReady || !this.picksReady || this.isSpinning) return;
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
