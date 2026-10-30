import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, of, Subscription, timeout, take, finalize } from 'rxjs';

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
export class WorkOrderWorkOrderMaintenanceComponent implements OnInit, OnDestroy {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  stepIndex = 0;
  currentWorkOrder!: WorkOrder;
  mapOfNewLineExpectedQuantity: { [key: string]: number } = {};
  mapOfNewByProductExpectedQuantity: { [key: string]: number } = {};
  validItemNames: string[] = [];

  lineItemLookups = new Map<WorkOrderLine, { loading: boolean; error: string; subscription?: Subscription }>();

  get lineItemLookupLoading(): boolean {
    return this.currentWorkOrder?.workOrderLines.some(line => this.lineItemLookups.get(line)?.loading) || false;
  }

  itemLookupLoading = false;
  itemLookupError = '';
  private itemLookupSequence = 0;
  private itemLookupSubscription?: Subscription;

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
    if (this.isSpinning || !this.validateManufacturedItem()) return;
    if (this.stepIndex >= 1 && !this.validateLineDetails()) return;
    this.stepIndex += 1;
  }

  confirm(): void {
    if (this.isSpinning || !this.validateManufacturedItem()) return;
    if (!this.validateLineDetails()) return;
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
  
  ngOnDestroy(): void {
    this.lineItemLookups.forEach(state => state.subscription?.unsubscribe());
    this.lineItemLookups.clear();
    this.itemLookupSequence++;
    this.itemLookupSubscription?.unsubscribe();
  }

  workOrderItemNameChanged(name: string): void {
    this.itemLookupSequence++;
    this.itemLookupSubscription?.unsubscribe();
    this.itemLookupLoading = false;
    this.itemLookupError = '';
    this.currentWorkOrder.itemId = undefined;
    this.currentWorkOrder.item = { ...this.getEmptyWorkOrder().item!, name: name || '' };
  }

  private validateManufacturedItem(): boolean {
    if (this.itemLookupLoading) {
      this.messageService.warning('Checking the item. Please wait before continuing.');
      return false;
    }
    if (!this.currentWorkOrder.itemId || this.itemLookupError) {
      this.itemLookupError = this.itemLookupError || 'Select a valid manufactured item before continuing.';
      this.messageService.warning(this.itemLookupError);
      this.stepIndex = 0;
      return false;
    }
    return true;
  }

  itemNameOnBlur(event: Event): void {
    this.resolveManufacturedItem((event.target as HTMLInputElement).value);
  }

  processWorkOrderItemQueryResult(itemName: any): void {
    if (typeof itemName !== 'string' || !itemName.trim()) return;
    this.workOrderItemNameChanged(itemName);
    this.resolveManufacturedItem(itemName);
  }

  private resolveManufacturedItem(value: string): void {
    const name = value.trim();
    if (this.currentWorkOrder.itemId && this.currentWorkOrder.item?.name === name && !this.itemLookupError) return;
    this.workOrderItemNameChanged(name);
    const sequence = this.itemLookupSequence;
    if (!name) {
      this.itemLookupError = 'Select a manufactured item before continuing.';
      return;
    }
    this.itemLookupLoading = true;
    this.itemLookupSubscription = this.getItemByName(name).pipe(
      timeout(15000),
      take(1),
      finalize(() => {
        if (sequence === this.itemLookupSequence) this.itemLookupLoading = false;
      }),
    ).subscribe({
      next: items => {
        if (sequence !== this.itemLookupSequence) return;
        const matches = items.filter(item => item.id && item.name?.toLowerCase() === name.toLowerCase());
        if (matches.length !== 1) {
          this.itemLookupError = matches.length > 1
            ? 'More than one item matches this number. Please verify the item master data.'
            : 'Item not found. Check the item number or select it using the search button.';
          return;
        }
        this.currentWorkOrder.itemId = matches[0].id;
        this.currentWorkOrder.item = matches[0];
        this.itemLookupError = '';
      },
      error: () => {
        if (sequence !== this.itemLookupSequence) return;
        this.itemLookupError = 'Unable to verify the item. Use the search button or enter the item number again to retry.';
      },
    });
  }

  workOrderLineItemNameChanged(name: string, line: WorkOrderLine): void {
    this.lineItemLookups.get(line)?.subscription?.unsubscribe();
    this.lineItemLookups.set(line, { loading: false, error: '' });
    line.itemId = undefined;
    line.item = { ...this.getEmptyWorkOrder().item!, name: name || '' };
  }

  workOrderLineItemNameOnBlur(event: Event, line: WorkOrderLine): void {
    this.resolveLineItem((event.target as HTMLInputElement).value, line);
  }

  processWorkOrderLineItemQueryResult(name: any, line: WorkOrderLine): void {
    if (typeof name !== 'string' || !name.trim()) return;
    this.workOrderLineItemNameChanged(name, line);
    this.resolveLineItem(name, line);
  }

  private resolveLineItem(value: string, line: WorkOrderLine): void {
    const name = value.trim();
    if (line.itemId && line.item?.name === name && !this.lineItemLookups.get(line)?.error) return;
    this.workOrderLineItemNameChanged(name, line);
    const state = this.lineItemLookups.get(line)!;
    if (!name) {
      state.error = 'Select a valid item for this work order line.';
      return;
    }
    state.loading = true;
    state.subscription = this.getItemByName(name).pipe(
      timeout(15000), take(1), finalize(() => state.loading = false),
    ).subscribe({
      next: items => {
        if (this.lineItemLookups.get(line) !== state) return;
        const matches = items.filter(item => item.id && item.name?.toLowerCase() === name.toLowerCase());
        if (matches.length !== 1) {
          state.error = matches.length > 1
            ? 'More than one item matches this number. Please verify the item master data.'
            : 'Item not found. Check the item number or use the search button.';
          return;
        }
        line.itemId = matches[0].id;
        line.item = matches[0];
        state.error = '';
      },
      error: () => {
        if (this.lineItemLookups.get(line) === state)
          state.error = 'Unable to verify this item. Use the search button or enter the item number again to retry.';
      },
    });
  }

  private validateLineItems(): boolean {
    for (const line of this.currentWorkOrder.workOrderLines) {
      const state = this.lineItemLookups.get(line);
      if (state?.loading) {
        this.messageService.warning(`Checking item on line ${line.number}. Please wait before continuing.`);
        this.stepIndex = 1;
        return false;
      }
      if (!line.itemId || state?.error) {
        const error = state?.error || 'Select a valid item for this work order line.';
        this.lineItemLookups.set(line, { ...state, loading: false, error });
        this.messageService.warning(`Line ${line.number}: ${error}`);
        this.stepIndex = 1;
        return false;
      }
    }
    return true;
  }

  removeWorkOrderLine(line: WorkOrderLine): void {
    this.lineItemLookups.get(line)?.subscription?.unsubscribe();
    this.lineItemLookups.delete(line);
    this.currentWorkOrder.workOrderLines = this.currentWorkOrder.workOrderLines.filter(existing => existing !== line);
  }
  inventoryStatusChange(newInventoryStatusName: string, workOrderLine: WorkOrderLine): void {
    this.availableInventoryStatuses.forEach(inventoryStatus => {
      if (inventoryStatus.name === newInventoryStatusName) {
        workOrderLine.inventoryStatus = inventoryStatus;
        workOrderLine.inventoryStatusId = inventoryStatus.id!;
      }
    });
  }

  private validateLineDetails(): boolean {
    if (!this.validateLineItems()) return false;
    for (const line of this.currentWorkOrder.workOrderLines) {
      let error = '';
      const value = this.newWorkOrder ? this.mapOfNewLineExpectedQuantity[line.number!] : line.expectedQuantity;
      if (!line.inventoryStatusId) {
        error = 'Select an inventory status before continuing.';
      } else if ((typeof value !== 'number' && typeof value !== 'string') || !Number.isFinite(Number(value)) || Number(value) <= 0) {
        error = 'Enter a quantity greater than 0 before continuing.';
      }
      if (error) {
        this.messageService.warning(`Line ${line.number}: ${error}`);
        this.stepIndex = 1;
        return false;
      }
    }
    return true;
  }

  addNewWorkOrderLine(): void {
    if (this.isSpinning || !this.validateLineDetails()) return;
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
