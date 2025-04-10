import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { InventoryService } from '../../inventory/services/inventory.service'; 
import { ItemService } from '../../inventory/services/item.service';
import { Printer } from '../../report/models/printer';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { CompanyService } from '../../warehouse-layout/services/company.service'; 
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../models/bill-of-material';
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
    standalone: false
})
export class WorkOrderWorkOrderProduceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  workOrderProduceTransaction!: WorkOrderProduceTransaction;
  consumeByBomQuantity = 'true'; // consume by BOM
  consumeByWorkOrderBOM = 'true';  // whether we consume by the BOM on the work order, 
                                 // or the user can select one BOM that matches with
                                 // the work order's item
  currentWorkOrder!: WorkOrder;
  findMatchedBOM = true;
  pageLoading = false;
  matchedBOM: BillOfMaterial[] = [];

  validInventoryStatuses: InventoryStatus[] = [];
  assignedProductionLines: ProductionLine[] = [];
  isCollapse = true;

  pageTitle: string;

  
  expandSet = new Set<number>(); 
  newLPNPrintLabelAtProducingFlag: boolean = false; 
  availablePrinters: Printer[] = []; 


  constructor(
    private activatedRoute: ActivatedRoute, 
    private titleService: TitleService,
    private workOrderService: WorkOrderService,
    private billOfMaterialService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private inventoryService: InventoryService,
    private printingService: PrintingService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private itemService: ItemService,
    private localCacheService: LocalCacheService,
    private warehouseConfigurationService: WarehouseConfigurationService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.produce');
  }

  ngOnInit(): void {
    this.pageLoading = true;
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.produce'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.workOrderService.getWorkOrder(params['id']).subscribe(workOrderRes => {
          this.currentWorkOrder = workOrderRes;
          if (this.currentWorkOrder.item == null && this.currentWorkOrder.itemId != null) {
            this.localCacheService.getItem(this.currentWorkOrder.itemId).subscribe({
              next: (itemRes) => {
                this.currentWorkOrder.item = itemRes;
                this.setupEmptyWorkOrderProduceTransaction(this.currentWorkOrder);
                this.loadMatchedBillOfMaterial(workOrderRes);
              }, 
              error: () => {                
                this.setupEmptyWorkOrderProduceTransaction(this.currentWorkOrder);
                this.loadMatchedBillOfMaterial(workOrderRes);
              }
            })
          }
          else {            
            this.setupEmptyWorkOrderProduceTransaction(this.currentWorkOrder);
            this.loadMatchedBillOfMaterial(workOrderRes);
          }
        });
      }
    });
    this.loadAvailableInventoryStatus();

    
    this.loadAvaiablePrinters();
  }

  
  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    if (this.warehouseService.getServerSidePrintingFlag() == true) {
      console.log(`will get printer from server`)
      this.printingService.getAllServerPrinters().subscribe(printers => {
        // this.availablePrinters = printers;
        printers.forEach(
          (printer, index) => {
            this.availablePrinters.push({
              id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
            });

          }); 
      })

    }
    else {

      console.log(`will get printer from local tools`)
      this.printingService.getAllLocalPrinters().forEach(
        (printer, index) => {
          this.availablePrinters.push({
            id: index, name: printer, description: printer, warehouseId: this.warehouseService.getCurrentWarehouse().id
          });

        });
    }

    //console.log(`availablePrinters: ${JSON.stringify(this.availablePrinters)}`);

  }

  loadMatchedBillOfMaterial(workOrder: WorkOrder) : void {

    this.billOfMaterialService.findMatchedBillOfMaterialByItemName(workOrder.item!.name)
        .subscribe({
          next: (billOfMaterialRes) => this.matchedBOM = billOfMaterialRes
        })
  }
  setupEmptyWorkOrderProduceTransaction(workOrder: WorkOrder): void {
      
    this.workOrderProduceTransaction = {
          id: undefined,
          workOrder,
          workOrderLineConsumeTransactions: this.getEmptyWorkOrderLineConsumeTransactions(),
          workOrderProducedInventories: [this.getEmptyWorkOrderProducedInventory()],
          consumeByBomQuantity: this.consumeByBomQuantity === 'true',
          consumeByBom: {
            id: undefined,
            number: "",
            description: "",
            billOfMaterialLines: [],
            workOrderInstructionTemplates: [],
            billOfMaterialByProducts: [],  
          },
          workOrderByProductProduceTransactions: [],
          workOrderKPITransactions: [],
          productionLine: undefined,
          printingNewLPNLabel: false,
          labelPrinterName: ""
    }; 
    if (this.workOrderProduceTransaction.consumeByBomQuantity && 
        this.consumeByWorkOrderBOM) {
        this.workOrderProduceTransaction.consumeByBom =
            this.workOrderProduceTransaction.workOrder?.billOfMaterial;
    }
    
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfiguration) => {
          this.workOrderProduceTransaction.printingNewLPNLabel = warehouseConfiguration.newLPNPrintLabelAtProducingFlag
      }
    })
  }

  consumeByWorkOrderBOMChanged() {
    if (this.consumeByWorkOrderBOM === 'false') {
      // will not consume from the bom on the work order
      // clear the data and let the user to select one from
      // all the matched bom
      this.workOrderProduceTransaction.consumeByBom = 
          {
            id: undefined,
            number: "",
            description: "",
            billOfMaterialLines: [],
            workOrderInstructionTemplates: [],
            billOfMaterialByProducts: [],  
          };
    }
    else {
      // will consume from the bom on the work order
      
      this.workOrderProduceTransaction.consumeByBom = 
          this.workOrderProduceTransaction.workOrder?.billOfMaterial;
    }
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
  matchedBOMChanged() {
    this.matchedBOM.filter(
      bom => bom.number === this.workOrderProduceTransaction!.consumeByBom!.number
    )
    .forEach(
      bom =>  {
        this.workOrderProduceTransaction!.consumeByBom = bom;
      
      }
    );
    
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
    if (this.validateProduceTransaction()) {
      
      sessionStorage.setItem('currentWorkOrderProduceTransaction', JSON.stringify(this.workOrderProduceTransaction));
      this.router.navigateByUrl(`/work-order/work-order/produce/confirm?id=${this.currentWorkOrder.id!}`);
    }


  }
  validateProduceTransaction(): boolean {
    // make sure all the necessary fields are filled in
    let result : boolean = true;

    let errorMessage : string = "";
    // make sure the produced invenotory has necessary field filled in
    if (this.workOrderProduceTransaction.workOrderProducedInventories
        .some(producedInventory => {
          if (producedInventory.lpn === undefined || producedInventory.lpn === null || producedInventory.lpn.trim().length === 0) {
            errorMessage = "please input lpn for produced inventory"
            return true;
          }
          if (producedInventory.quantity === undefined || producedInventory.quantity === null ) {
            errorMessage = "please input quantity for produced inventory"
            return true;
          }
          if (producedInventory.inventoryStatusId === undefined || producedInventory.inventoryStatusId === null) {
            errorMessage = "please input inventory status for produced inventory"
            return true;
          }
          if (producedInventory.itemPackageTypeId === undefined || producedInventory.itemPackageTypeId === null) {
            errorMessage = "please input item package type for produced inventory"
            return true;
          }
          return false;
        })) {
  
          this.messageService.error(errorMessage);
          return false;
    }

    // setup the missing field before we start validating the
    // consume by bom 
    
    if (this.consumeByWorkOrderBOM === 'true') {          
      this.workOrderProduceTransaction.consumeByBom = this.workOrderProduceTransaction.workOrder?.consumeByBom;
    }
    
    // if we consume by BOM, make sure the bom is passed in 

    
    if (this.workOrderProduceTransaction.consumeByBomQuantity &&
          (this.workOrderProduceTransaction.consumeByBom?.id === undefined ||
            this.workOrderProduceTransaction.consumeByBom?.id === null
    )) {

        this.messageService.error("BOM needs to be setup to produce from the work order");
        return false;
    }

    return true;
  }

  getEmptyWorkOrderProducedInventory(): WorkOrderProducedInventory {
    let inventory : WorkOrderProducedInventory = {
      id: undefined,

      lpn: '',
      itemPackageTypeId: undefined,
      itemPackageType: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
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
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
      },
    };

    // let's make the default item package type and inventory status
    if (this.currentWorkOrder.item != null) {
      if (this.currentWorkOrder.item.defaultItemPackageType != null) {

        inventory.itemPackageTypeId = this.currentWorkOrder.item.defaultItemPackageType.id;
        inventory.itemPackageType = this.currentWorkOrder.item.defaultItemPackageType;
      }
      else if (this.currentWorkOrder.item.itemPackageTypes.length == 1) {
        
        inventory.itemPackageTypeId = this.currentWorkOrder.item.itemPackageTypes[0].id;
        inventory.itemPackageType = this.currentWorkOrder.item.itemPackageTypes[0];
      }
    }
    this.inventoryStatusService.getAvailableInventoryStatuses().subscribe(
      {
        next: (availableInventoryStatuses) => {
          if (availableInventoryStatuses.length > 0) {
            inventory.inventoryStatusId = availableInventoryStatuses[0].id;
            inventory.inventoryStatus = availableInventoryStatuses[0];
          }
        }
      }
    )
    return inventory;
  }
  onConsumeByBomQuantityChanged(consumeByBomQuantity: string): void {
    this.consumeByBomQuantity = consumeByBomQuantity;
    this.workOrderProduceTransaction.consumeByBomQuantity = consumeByBomQuantity === 'true'; 
    if (this.workOrderProduceTransaction.consumeByBomQuantity) {

      if (this.consumeByWorkOrderBOM === 'true') {
          // if we are consumed by bom on the work order, let's setup
          // the value
          this.workOrderProduceTransaction.consumeByBom = 
              this.workOrderProduceTransaction.workOrder?.billOfMaterial;
      }
      else {
        
        this.workOrderProduceTransaction.consumeByBom = {
          id: undefined,
          number: "",
          description: "",
          billOfMaterialLines: [],
          workOrderInstructionTemplates: [],
          billOfMaterialByProducts: [],  
        };
      }
    }
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

  removeProducedInventory(index: number) : void { 
    this.workOrderProduceTransaction.workOrderProducedInventories.splice(index, 1);

    // will need to expand the array and assign it back so it will refresh the table display
    this.workOrderProduceTransaction.workOrderProducedInventories = [...this.workOrderProduceTransaction.workOrderProducedInventories]; 
  }

  productionLineChanged(productionLineName: string) { 
    
    this.workOrderProduceTransaction.labelPrinterName = "";

    const productionLineAssignments: ProductionLineAssignment[] | undefined =
      this.currentWorkOrder.productionLineAssignments?.filter(
        productionLineAssignment => productionLineAssignment.productionLine.name === productionLineName
      );
    if (productionLineAssignments != undefined &&
      productionLineAssignments.length > 0) {

      this.workOrderProduceTransaction.productionLine = productionLineAssignments[0].productionLine; 

      // setup the label printer based on the default printer for the production line
      if (this.workOrderProduceTransaction.productionLine.labelPrinterName != null) {
        this.workOrderProduceTransaction.labelPrinterName = this.workOrderProduceTransaction.productionLine.labelPrinterName;
        // setup the label printer index as well. The local printing plug in may need the index as well
        
        this.labelPrinterChanged();
      }
    }
    else {
      this.workOrderProduceTransaction.productionLine = undefined;
    }
  }
  labelPrinterChanged() {
    this.workOrderProduceTransaction.labelPrinterIndex = this.availablePrinters.findIndex(printer => printer.name == this.workOrderProduceTransaction.labelPrinterName);
     
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
      this.loadNonpickedInventory(workOrderLineConsumeTransaction);

    } else {
      this.expandSet.delete(workOrderLineConsumeTransaction.workOrderLine!.id!); 
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
