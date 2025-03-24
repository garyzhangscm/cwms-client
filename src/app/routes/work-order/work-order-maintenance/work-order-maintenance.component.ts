import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of } from 'rxjs';

import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { WorkOrder } from '../models/work-order';
import { WorkOrderByProduct } from '../models/work-order-by-product';
import { WorkOrderInstruction } from '../models/work-order-instruction'; 
import { WorkOrderLine } from '../models/work-order-line';
import { BillOfMaterialService } from '../services/bill-of-material.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-work-order-maintenance',
    templateUrl: './work-order-maintenance.component.html',
    styleUrls: ['./work-order-maintenance.component.less'],
    standalone: false
})
export class WorkOrderWorkOrderMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  stepIndex = 0;
  currentWorkOrder!: WorkOrder;
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  mapOfNewByProductExpectedQuantity: { [key: string]: number } = {};
  validItemNames: string[] = [];

  isSpinning = false;
  availableInventoryStatuses: InventoryStatus[] = [];
  newWorkOrder = true;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private titleService: TitleService, 
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService,
    private billOfMeasureService: BillOfMaterialService,
    private inventoryStatusService: InventoryStatusService,
    private companyService: CompanyService,
    private workOrderService: WorkOrderService,

    private itemService: ItemService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.work-order.new');
  }

  ngOnInit(): void {
    this.pageTitle = this.i18n.fanyi('page.work-order.new');
    this.titleService.setTitle(this.i18n.fanyi('page.work-order.new'));
    this.stepIndex = 0;

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.isSpinning = true;
        this.workOrderService.getWorkOrder(params['id']).subscribe(
          {
            next: (workOrderRes) => {
              this.currentWorkOrder = workOrderRes;
              this.loadItemInformation(this.currentWorkOrder);
              this.newWorkOrder = false;
              this.isSpinning = false;
            }
          }); 
      } else {
        // ID is not in the url, which probably means we are adding a new BOM
        this.currentWorkOrder = this.getEmptyWorkOrder();
        this.newWorkOrder = true;
      }
    });
 
    this.inventoryStatusService
      .loadInventoryStatuses()
      .subscribe(inventoryStatuses => (this.availableInventoryStatuses = inventoryStatuses));
  }

  
  loadItemInformation(workOrder: WorkOrder) {

    // ok, we will group the items all together then 
    // load the item in one transaction
    // to increase performance      
    let itemIdSet = new Set<number>(); 
    
    if (workOrder.itemId != null && workOrder.item == null) {

      itemIdSet.add(workOrder.itemId!); 
    }
    workOrder.workOrderLines.filter(
      workOrderLine => workOrderLine.itemId != null && workOrderLine.item == null
    ).forEach(
      workOrderLine => itemIdSet.add(workOrderLine.itemId!)
    )
    workOrder.workOrderByProducts.filter(
      workOrderByProduct => workOrderByProduct.itemId != null && workOrderByProduct.item == null
    ).forEach(
      workOrderByProduct => itemIdSet.add(workOrderByProduct.itemId!)
    )
    
    if (itemIdSet.size > 0) {

      let itemMap = new Map<number, Item>(); 
      let itemIdList : string = Array.from(itemIdSet).join(',')
      this.itemService.getItemsByIdList(itemIdList, false).subscribe({
        next: (itemRes) => {

          // add the result to a map so we can assign it to 
          // the work order / work order line later on
          itemRes.forEach(
            item =>  itemMap.set(item.id!, item)
          );

          this.setupWorkOrderItems(workOrder, itemMap); 
          
        }
      })
    }
  } 
  setupWorkOrderItems(workOrder: WorkOrder, itemMap : Map<number, Item>) { 
      // only assign if we get the item from the server
      if (itemMap.has(workOrder.itemId!)) {
        workOrder.item = itemMap.get(workOrder.itemId!);        
      }

      workOrder.workOrderLines.forEach(
        workOrderLine => {                    
          if (itemMap.has(workOrderLine.itemId!)) {
            workOrderLine.item = itemMap.get(workOrderLine.itemId!)
            // this.loadDefaultStockUom(workOrderLine.item!);
          }
        }
      )
      workOrder.workOrderByProducts.forEach(
        byProduct => {                    
          if (itemMap.has(byProduct.itemId!)) {
            byProduct.item = itemMap.get(byProduct.itemId!)
            // this.loadDefaultStockUom(byProduct.item!);
          }
        }
      ) 
  }
  getEmptyWorkOrder(): WorkOrder {
    return {
      
      workOrderLines: [],
      workOrderInstructions: [],
      
      assignments: [],
      workOrderKPIs: [],
      workOrderByProducts: [],
      warehouseId: this.warehouseService.getCurrentWarehouse().id, 
      warehouse: this.warehouseService.getCurrentWarehouse(),
       
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

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
      expectedQuantity: 0,
    };
  }
 
  workOrderNumberChanged(newWorkOrderNumber: string) {
    
    this.currentWorkOrder.number = newWorkOrderNumber;
  }
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void {
    this.isSpinning = true; 
    this.setupWorkOrderQuantity();

    
    if (!this.newWorkOrder) {
      this.workOrderService.changeWorkOrder(this.currentWorkOrder).subscribe(
        {
          next: () => {
            setTimeout(() => {
              
              this.isSpinning = false;
              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              this.router.navigateByUrl(`/work-order/work-order?number=${this.currentWorkOrder.number}`);
            }, 500);
          },
          error: () => this.isSpinning = false

        });
    } else {
      this.workOrderService.addWorkOrder(this.currentWorkOrder).subscribe(
        {
          next: () => {
            setTimeout(() => {
              this.isSpinning = false;
              this.messageService.success(this.i18n.fanyi('message.create.complete'));
              this.router.navigateByUrl(`/work-order/work-order?number=${this.currentWorkOrder.number}`);
            }, 500);
          },
          error: () => this.isSpinning = false


        })
    }
  }
 
  // save the changed quantity to the
  // Work Order
  // Work Order Line
  // By Product
  setupWorkOrderQuantity(): void {
    this.currentWorkOrder.workOrderLines.forEach(
      workOrderLine =>
        (workOrderLine.expectedQuantity = this.mapOfNewLineExpectedQuantity[workOrderLine.number!]),
    );
    this.currentWorkOrder.workOrderByProducts.forEach(
      byProduct => (byProduct.expectedQuantity = this.mapOfNewByProductExpectedQuantity[byProduct.itemId!]),
    );
  }
  getItemByName(itemName: string) : Observable<Item[]> {
    
    if (itemName === '') {
      return of([{
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

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
      }]);
    } else {
      return this.itemService.getItems(itemName);
    }
  }
  
  itemNameOnBlur(event: Event): void {
    const itemName: string = (event.target as HTMLInputElement).value;
    console.log(`Item of BOM change to ${itemName.trim()}`);
    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            this.currentWorkOrder.itemId = itemsRes[0].id;
            this.currentWorkOrder.item = itemsRes[0];
          }
        }
      }
    )
    
  }
  
  processWorkOrderItemQueryResult(itemName: any): void {
    console.log(`start to query with item name ${itemName}`);
    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            this.currentWorkOrder.itemId = itemsRes[0].id;
            this.currentWorkOrder.item = itemsRes[0];
          }
        }
      }
    )
    
    
  }
  workOrderLineItemNameOnBlur(event: Event, workOrderLine: WorkOrderLine): void {
    const itemName: string = (event.target as HTMLInputElement).value.trim();
    console.log(`Item of billOfMaterialLine change to ${itemName}`);
    workOrderLine.itemId = undefined;
    workOrderLine.item = undefined;
    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            workOrderLine.itemId = itemsRes[0].id;
            workOrderLine.item = itemsRes[0];
          }
        }
      }
    ) 
  }
 
  // BOM Line related functions
  processWorkOrderLineItemQueryResult(itemName: any, workOrderLine: WorkOrderLine): void { 
    console.log(`Item of work order line change to ${itemName}`);
    
    workOrderLine.itemId = undefined;
    workOrderLine.item = undefined;
    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            workOrderLine.itemId = itemsRes[0].id;
            workOrderLine.item = itemsRes[0];
          }
        }
      }
    ) 
  }
  removeWorkOrderLine(workOrderLine: WorkOrderLine): void { 
    this.currentWorkOrder.workOrderLines = this.currentWorkOrder.workOrderLines.filter(
      existingWorkOrderLine => existingWorkOrderLine.number !== workOrderLine.number,
    );
  }
  inventoryStatusChange(newInventoryStatusName: string, workOrderLine: WorkOrderLine): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        workOrderLine.inventoryStatus = inventoryStatus;
        workOrderLine.inventoryStatusId = inventoryStatus.id!;
      }
    });
  }

  addNewWorkOrderLine(): void {
    this.currentWorkOrder.workOrderLines = [
      ...this.currentWorkOrder.workOrderLines,
      this.getEmptyWorkOrderLine(),
    ];
  }

  getNextLineNumber(): string {
    let maxLineNumber = 0;
    this.currentWorkOrder.workOrderLines.forEach(workOrderLine => {
      if (!isNaN(Number(workOrderLine.number)) && maxLineNumber <= Number(workOrderLine.number)) {
        maxLineNumber = Number(workOrderLine.number) + 1;
      }
    });
    return `${maxLineNumber  }`;
  }
  getEmptyWorkOrderLine(): WorkOrderLine {
    return { 
      number: this.getNextLineNumber(), 

      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],

        client: undefined,
        itemFamily: undefined,
        unitCost: undefined,

        allowCartonization: undefined,
        allowAllocationByLPN: undefined,
        allocationRoundUpStrategyType: undefined,

        allocationRoundUpStrategyValue: undefined,

        trackingVolumeFlag: undefined,
        trackingLotNumberFlag: undefined,
        trackingManufactureDateFlag: undefined,
        shelfLifeDays: undefined,
        trackingExpirationDateFlag: undefined,
      },
      expectedQuantity: 0, 
    };
  }

  // Working Instruction  related functions
  removeInstruction(workOrderInstruction: WorkOrderInstruction): void {
    this.currentWorkOrder.workOrderInstructions = this.currentWorkOrder.workOrderInstructions.filter(
      existingInstruction => existingInstruction.sequence !== workOrderInstruction.sequence,
    );
  }
  addNewInstruction(): void {
    this.currentWorkOrder.workOrderInstructions = [
      ...this.currentWorkOrder.workOrderInstructions,
      this.getEmptyInstruction(),
    ];
  }
  getEmptyInstruction(): WorkOrderInstruction {
    return { 
      workOrder: this.currentWorkOrder,
      sequence: this.getNextInstructionSequence(),
      instruction: '',
    };
  }

  getNextInstructionSequence(): number {
    let maxSequence = 0;
    this.currentWorkOrder.workOrderInstructions.forEach(instruction => {
      if (!isNaN(Number(instruction.sequence)) && maxSequence <= Number(instruction.sequence)) {
        maxSequence = Number(instruction.sequence) + 1;
      }
    });
    return maxSequence;
  }

  byProductItemNameOnBlur(event: Event, byProduct: WorkOrderByProduct): void {
    const itemName: string = (event.target as HTMLInputElement).value.trim();
    console.log(`Item of by production change to ${itemName}`);
    byProduct.itemId = undefined;
    byProduct.item = undefined;
    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            byProduct.itemId = itemsRes[0].id;
            byProduct.item = itemsRes[0];
          }
        }
      }
    ) 
  }

  // By Product related functions
  processWorkOrderByProductItemQueryResult(itemName: string, byProduct: WorkOrderByProduct): void {
    
    byProduct.itemId = undefined;
    byProduct.item = undefined;

    this.getItemByName(itemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length > 0) {

            byProduct.itemId = itemsRes[0].id;
            byProduct.item = itemsRes[0];
          }
        }
      }
    ) 
 
  }
  byProductInventoryStatusChange(newInventoryStatusName: string, byProduct: WorkOrderByProduct): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        byProduct.inventoryStatus = inventoryStatus;
        byProduct.inventoryStatusId = inventoryStatus.id;
      }
    });
  }
  removeByProduct(byProduct: WorkOrderByProduct): void {
    this.currentWorkOrder.workOrderByProducts = this.currentWorkOrder.workOrderByProducts.filter(
      existingByProduct => {
        if (existingByProduct.itemId !== null && byProduct.itemId !== null) {
          return existingByProduct.itemId !== byProduct.itemId;
        } 
        return true;
      },
    );
  }
  addNewByProduct(): void {
    this.currentWorkOrder.workOrderByProducts = [
      ...this.currentWorkOrder.workOrderByProducts,
      this.getEmptyByProduct(),
    ];
  }

  getEmptyByProduct(): WorkOrderByProduct {
    return {
      id: undefined, 
      itemId: undefined,
      item: {
        id: undefined,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,
        name: '',
        description: '',
        itemPackageTypes: [],
        allowCartonization: undefined,

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
      expectedQuantity: 0,
      producedQuantity: 0,

      inventoryStatusId: undefined,
      inventoryStatus: undefined,
    };
  } 

}
