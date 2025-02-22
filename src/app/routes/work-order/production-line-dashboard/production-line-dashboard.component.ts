import {  Component, ElementRef, inject, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  FormBuilder, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { I18NService } from '@core'; 
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { Subscription, interval } from 'rxjs';

import { UserService } from '../../auth/services/user.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemPackageType } from '../../inventory/models/item-package-type';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemService } from '../../inventory/services/item.service';
import { SystemControlledNumberService } from '../../util/services/system-controlled-number.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line'; 
import { ProductionLineType } from '../models/production-line-type';  
import { WorkOrder } from '../models/work-order';
import { WorkOrderProduceTransaction } from '../models/work-order-produce-transaction';
import { ProductionLineTypeService } from '../services/production-line-type.service';
import { ProductionLineService } from '../services/production-line.service'; 
import { WorkOrderProduceTransactionService } from '../services/work-order-produce-transaction.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-production-line-dashboard',
    templateUrl: './production-line-dashboard.component.html',
    styleUrls: ['./production-line-dashboard.component.less'],
    standalone: false
})
export class WorkOrderProductionLineDashboardComponent implements OnInit , OnDestroy { 
   
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;
  productionLineType = "All";
  productionLineTypes: ProductionLineType[] = [];
  productionLines: ProductionLine[] = [];
  workOrders : WorkOrder[] = [];
  doNotRefreshFlag = false;
  autoGenerateNewLPNFlag = true;
  onlyShowActiveProductionLineFlag = true;

  // production line and work order that the current production will take place
  currentProductionLineName = "";
  currentWorkOrderName = ""; 
  validInventoryStatuses : InventoryStatus[] = [];
  availableInventoryStatus?: InventoryStatus;
  currentProducingItem? : Item;
  currentProducingItemPackageType? : ItemPackageType;
  currentProducingUnitOfMeasure?: ItemUnitOfMeasure;
  produceAtLPNUOM = false;

  
  // display height for each box, in px.
  // we will need to calculate it dynamicly since one machine may
  // have multiple item assigned
  // 1. if the machine allowed multiple items assigned at the same time
  // 2. the machine only allow one item at a time but within the shift, there
  //    was multiple items on the machine
  displayHeight: number = 150;
  
  productionLineTypeLocalStorageKey = "production_line_dashboard_production_line_key";
  refreshCountCycleLocalStorageKey = "production_line_dashboard_refresh_cycle_key";
  doNotRefreshLocalStorageKey = "production_line_dashboard_donot_fresh_key";
  autoGenerateNewLPNLocalStorageKey = "production_line_dashboard_auto_generate_new_lpn";
  onlyShowActiveProductionLineLocalStorageKey = "production_line_dashboard_only_show_production_line";


  gridStyle = {
    width: '12.5%',
    textAlign: 'center',
    padding: '2px'
  };
  
  refreshCountCycle = 60;
  countDownNumber = this.refreshCountCycle;
  countDownsubscription!: Subscription;
  loadingData = false;
  showConfiguration = false;
  
  produceInventoryForm!: UntypedFormGroup;
  produceInventoryModal!: NzModalRef;

  @ViewChild('producingInventoryQuantity', {static: false}) producingInventoryQuantity!: ElementRef;
 
  displayOnly = false;

  constructor(private http: _HttpClient,  
    private fb: UntypedFormBuilder,
    private formBuilder: FormBuilder,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService, 
    private productionLineTypeService: ProductionLineTypeService,
    private systemControlledNumberService: SystemControlledNumberService,
    private workOrderService: WorkOrderService, 
    private workOrderProduceTransactionService: WorkOrderProduceTransactionService,
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private inventoryStatusService: InventoryStatusService,
    private userService: UserService, ) {  
      userService.isCurrentPageDisplayOnly("/work-order/production-line-dashboard").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );
  }

  ngOnInit(): void {
    this.loadAvailableProductionLineTypes();
    this.loadInventoryStatuses();
     

    if (localStorage.getItem(this.productionLineTypeLocalStorageKey)) {
      this.productionLineType = localStorage.getItem(this.productionLineTypeLocalStorageKey)!;
    }
    if (localStorage.getItem(this.refreshCountCycleLocalStorageKey)) { 
      this.refreshCountCycle = +localStorage.getItem(this.refreshCountCycleLocalStorageKey)!;
      this.countDownNumber = this.refreshCountCycle;
    }
    
    if (localStorage.getItem(this.doNotRefreshLocalStorageKey)) { 
      this.doNotRefreshFlag = localStorage.getItem(this.doNotRefreshLocalStorageKey) === 'true'; 
    }
    if (localStorage.getItem(this.autoGenerateNewLPNLocalStorageKey)) { 
      this.autoGenerateNewLPNFlag = localStorage.getItem(this.autoGenerateNewLPNLocalStorageKey) === 'true'; 
    }
    if (localStorage.getItem(this.onlyShowActiveProductionLineLocalStorageKey)) { 
      this.onlyShowActiveProductionLineFlag = localStorage.getItem(this.onlyShowActiveProductionLineLocalStorageKey) === 'true'; 
    }
  
  
    if (this.productionLineType == "All") {
      this.refresh();
    }
    else {
      this.refresh(this.productionLineType);
    }
    
    this.countDownsubscription = interval(1000).subscribe(x => {
      this.handleCountDownEvent();
    });
  } 
  loadInventoryStatuses() : void {
    this.inventoryStatusService.loadInventoryStatuses().subscribe({
      next: (inventoryStatusRes) => { 
        this.validInventoryStatuses = inventoryStatusRes;
        this.validInventoryStatuses.forEach(
          inventoryStatus => {
            if (inventoryStatus.availableStatusFlag) {
              this.availableInventoryStatus = inventoryStatus;
            }
          }
        )
      }
    })
  }
  loadAvailableProductionLineTypes() : void {
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: (productionLineTypeRes) => this.productionLineTypes = productionLineTypeRes
    })
  }

  refresh(productionLineTypeName?: string) {
    this.isSpinning = true;
    this.productionLineService.getProductionLines(undefined, productionLineTypeName, false, false).subscribe({
      next: (productionLineRes) => { 
        if (this.onlyShowActiveProductionLineFlag) {
            // ok, we will only show the active production line
            this.productionLines = productionLineRes.filter(
              productionLine =>  productionLine.assignedWorkOrders && productionLine.assignedWorkOrders.length > 0);
        }
        else {
          this.productionLines = productionLineRes;
        }

        this.setDisplayHeight(this.productionLines);
        this.loadItemInformationForProductionLines(this.productionLines);
        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
  }
  
  // load the item information for the work order that assigned to this production
  // if the production line has assignment
  loadItemInformationForProductionLines(productionLines: ProductionLine[]) {
    if (productionLines == null){
      return;
    }
    // load the item information, 1 at a time
    this.loadItemInformationForProductionLine(productionLines, 0)
  }
  loadItemInformationForProductionLine(productionLines: ProductionLine[], index: number) {
      if (index >= productionLines.length) {
        return;
      }

      if (productionLines[index].assignedWorkOrders !=  null) {
        this.loadItemInformationForAssignedWorkOrder(productionLines, index, 0);
      }
      else {
        this.loadItemInformationForProductionLine(productionLines, index + 1);
      }   
  }
  
  loadItemInformationForAssignedWorkOrder(
    productionLines: ProductionLine[], productionLinesIndex: number,  index: number) {
    if (index >= productionLines[productionLinesIndex].assignedWorkOrders!.length) {
        // we already loop through all assigned work order in this production line, let's continue
        // with next line
        
        this.loadItemInformationForProductionLine(productionLines, productionLinesIndex + 1);
    }

    if (productionLines[productionLinesIndex].assignedWorkOrders![index] == null) {
      return;
    }
    
    if ((productionLines[productionLinesIndex].assignedWorkOrders![index].second == null 
          || productionLines[productionLinesIndex].assignedWorkOrders![index].second == "") &&
          productionLines[productionLinesIndex].assignedWorkOrders![index].sixth != null) {
              this.itemService.getItem(productionLines[productionLinesIndex].assignedWorkOrders![index].sixth).subscribe({
                next: (itemRes) => { 
                  productionLines[productionLinesIndex].assignedWorkOrders![index].second = itemRes.name;
                  productionLines[productionLinesIndex].assignedWorkOrders![index].third = itemRes.description;
                  this.loadItemInformationForAssignedWorkOrder(
                    productionLines, productionLinesIndex, index + 1
                  );
                }, 
                error: () => this.loadItemInformationForAssignedWorkOrder(
                  productionLines, productionLinesIndex, index + 1
                )
       })
    } 
  }
    
  handleCountDownEvent(): void {
    // don't refresh the result if the flag is checked
    if (this.doNotRefreshFlag) {
      return;
    }
     
    // don't count down when we are loading data
    if (this.loadingData) {      
      this.resetCountDownNumber();
      return;
    }
    this.countDownNumber--;
    if (this.countDownNumber <= 0) {
      this.resetCountDownNumber();
      
      if (this.productionLineType == "All") {
        this.refresh();
      }
      else {

        this.refresh(this.productionLineType);
      }
    } 

  }
  
  resetCountDownNumber() {
    this.countDownNumber = this.refreshCountCycle;
  }
  
  ngOnDestroy() {
    this.countDownsubscription.unsubscribe();  
  }
  
  refreshCountCycleChanged() {
    
    localStorage.setItem(this.refreshCountCycleLocalStorageKey, this.refreshCountCycle.toString());
  }
  doNotRefreshFlagChanged() {
    
    localStorage.setItem(this.doNotRefreshLocalStorageKey, this.doNotRefreshFlag.toString());
  }
  onlyShowActiveProductionLineFlagChanged() {
    
    localStorage.setItem(this.onlyShowActiveProductionLineLocalStorageKey, this.onlyShowActiveProductionLineFlag.toString());
  }
  autoGenerateNewLPNFlagChanged() {
    
    localStorage.setItem(this.autoGenerateNewLPNLocalStorageKey, this.autoGenerateNewLPNFlag.toString());
  }
  productionLineTypeChanged() {
    
    localStorage.setItem(this.productionLineTypeLocalStorageKey, this.productionLineType)
    if (this.productionLineType == "All") {
      this.refresh();
    }
    else {

      this.refresh(this.productionLineType);
    }

  }
  
  setDisplayHeight(productionLines: ProductionLine[]) {
    let maxItemCount = Math.max(...productionLines.map(productionLines => 
          productionLines.assignedWorkOrders == null ? 0 : productionLines.assignedWorkOrders.length));
    this.displayHeight = 150 + (maxItemCount - 1) * 35;
    console.log(`set height to ${this.displayHeight}`);
   }

  getBodyStyle(productionLine: ProductionLine) {
    if (productionLine.assignedWorkOrders && productionLine.assignedWorkOrders.length > 0) {
      // work order assigned
      return  {'background-color': 'green', 'color': 'white', 'font-weight':'bold', 'height': `${this.displayHeight }px`} ; 
    }
    else {
      // no work order assigned
      return  {'background-color': 'grey', 'font-weight':'bold', 'height':`${this.displayHeight }px`} ;  
    }
     
  }

   
  openProducingInventoryModal( 
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
    productionLine: ProductionLine,
    workOrderNumber: string,
    itemName: string,
    itemDescription: string,
  ): void {
    this.isSpinning = true;
    this.itemService.getItems(itemName).subscribe({
      next: (itemRes) => {
        this.isSpinning = false;

        this.currentProducingItem = itemRes[0];

        // setup default item package type and unit of measure
        // for the item
        this.currentProducingItemPackageType = this.currentProducingItem?.defaultItemPackageType;
        if (this.currentProducingItemPackageType) {

            this.newInventoryItemPackageTypeChanged(this.currentProducingItemPackageType.id!);
        }
        else {
          this.currentProducingUnitOfMeasure = undefined;
        }

        if (this.autoGenerateNewLPNFlag) {
          
          this.systemControlledNumberService
            .getNextAvailableId("lpn")
            .subscribe(nextLPN => { 
              this.openProducingInventoryModalWithNewLPN(
                tplInventoryMoveModalTitle, tplInventoryMoveModalContent,
                productionLine, workOrderNumber, 
                this.currentProducingItem!, nextLPN);
            });
        }
        else {
          
          this.openProducingInventoryModalWithNewLPN(
            tplInventoryMoveModalTitle, tplInventoryMoveModalContent,
            productionLine, workOrderNumber, 
            this.currentProducingItem!, "");
        }
    

      }, 
      error: () => {
        this.isSpinning = false;
        this.messageService.error(`can't find the item ${itemName}`);
        
      }
    });
  }
  
  openProducingInventoryModalWithNewLPN( 
    tplInventoryMoveModalTitle: TemplateRef<{}>,
    tplInventoryMoveModalContent: TemplateRef<{}>, 
    productionLine: ProductionLine,
    workOrderNumber: string,
    item: Item,
    newLPN: string
  ): void { 
    
    this.currentProductionLineName = productionLine.name;
    this.currentWorkOrderName = workOrderNumber;

    // console.log(`openProducingInventoryModalWithNewLPN with status ${JSON.stringify(this.availableInventoryStatus)} and item package type ${JSON.stringify(this.currentProducingItemPackageType)}`);

    this.produceInventoryForm = this.fb.group({
      lpn: new UntypedFormControl({ value: newLPN , disabled: false}),
      itemNumber: new UntypedFormControl({ value: item.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: item.description, disabled: true }),
      inventoryStatus: this.formBuilder.control(this.availableInventoryStatus?.id, [Validators.required]),
      itemPackageType: this.formBuilder.control(this.currentProducingItemPackageType?.id, [Validators.required]),
      quantity:  [this.produceAtLPNUOM ? "1" : "", [Validators.required]], 
      producingUnitOfMeasure: this.formBuilder.control(this.currentProducingUnitOfMeasure?.id, [Validators.required]),
      
    }); 
    
    if (this.produceAtLPNUOM) { 
        this.produceInventoryForm.get("quantity")?.disable();
    }
    else {
      
      this.produceInventoryForm.get("quantity")?.enable();
    }

 
    // Load the location
    this.produceInventoryModal = this.modalService.create({
      nzTitle: tplInventoryMoveModalTitle,
      nzContent: tplInventoryMoveModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.produceInventoryModal.destroy(); 
      },
      nzOnOk: () => { 
        // disable the OK button to prevent double receiving
        this.produceInventoryModal.updateConfig({ 
          nzOkDisabled: true,
          nzOkLoading: true
        });

        console.log(`this.produceInventoryForm.valid: ${this.produceInventoryForm.valid}`);

        if (!this.produceInventoryForm.valid) {
          Object.values(this.produceInventoryForm.controls).forEach(control => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });

          this.produceInventoryModal.updateConfig({ 
            nzOkDisabled: false,
            nzOkLoading: false
          });
          return false;
        }
        if (!this.currentProducingUnitOfMeasure) {
          this.messageService.error("can't get the UOM information");
          
          this.produceInventoryModal.updateConfig({ 
            nzOkDisabled: false,
            nzOkLoading: false
          });
          return false;
        }
        // get the unit quantity first
        let unitQuantity = this.produceInventoryForm.value.quantity.value * 
            this.currentProducingUnitOfMeasure!.quantity!;
        this.produceInventory(workOrderNumber, productionLine, unitQuantity);
        
        this.produceInventoryModal.updateConfig({ 
          nzOkDisabled: false,
          nzOkLoading: false
        });
        return true;
      },

      nzWidth: 1000,
    });
    this.produceInventoryModal.afterOpen.subscribe(
      () => { 
        setTimeout(() => {
          if (this.producingInventoryQuantity.nativeElement) {
             this.producingInventoryQuantity.nativeElement.focus() ;
             console.log(`focus on the quantity field`);
          }
        }, 0);
      }
    ); 
  } 
  
  producingUnitOfMeasureChanged(itemUnitOfMeasureId: number) { 
    if (this.currentProducingItemPackageType != null) {

      this.currentProducingUnitOfMeasure = 
        this.currentProducingItemPackageType!.itemUnitOfMeasures.find(
          itemUnitOfMeasure => itemUnitOfMeasure.id == itemUnitOfMeasureId
        );
      
    }

    if (this.currentProducingUnitOfMeasure && this.currentProducingUnitOfMeasure.trackingLpn) {
      this.produceAtLPNUOM = true;
      if (this.produceInventoryForm) {
        this.produceInventoryForm.value.quantity.setValue("1");
        this.produceInventoryForm.get("quantity")?.disable();
      }
    }
    else {
      
      this.produceAtLPNUOM = false;
      this.produceInventoryForm.get("quantity")?.enable();
    } 

  } 
  newInventoryItemPackageTypeChanged(itemPackageTypeId: number) {
    let selectedItemPackageType : ItemPackageType | undefined = 
        this.currentProducingItem!.itemPackageTypes!.find(
          itemPackageType => itemPackageType.id = itemPackageTypeId
        );

    this.currentProducingItemPackageType = selectedItemPackageType;

    if (selectedItemPackageType != null) {
      if (selectedItemPackageType.defaultWorkOrderReceivingUOM) {
        // set the display unit of measure
        // console.log(`set the display item unit of measure to \n${JSON.stringify(selectedItemPackageType.defaultWorkOrderReceivingUOM)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.defaultWorkOrderReceivingUOM;
        if (this.produceInventoryForm) {
          this.produceInventoryForm!.value.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      }
      else if (selectedItemPackageType.displayItemUnitOfMeasure) {
        // set the display unit of measure
        // console.log(`set the display item unit of measure to \n${JSON.stringify(selectedItemPackageType.displayItemUnitOfMeasure)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.displayItemUnitOfMeasure;
        if (this.produceInventoryForm) {
            this.produceInventoryForm!.value.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
        // this.receivingForm!.controls.itemUnitOfMeasure.setValue(this.currentReceivingInventory!.itemPackageType.displayItemUnitOfMeasure.id);
      }
      else if (selectedItemPackageType.stockItemUnitOfMeasure) {
        // set the display unit of measure
        // console.log(`set the display stock item unit of measure to \n${JSON.stringify(selectedItemPackageType.stockItemUnitOfMeasure)}`);

        this.currentProducingUnitOfMeasure = selectedItemPackageType.stockItemUnitOfMeasure; 
        if (this.produceInventoryForm) {
            this.produceInventoryForm!.value.producingUnitOfMeasure.setValue(this.currentProducingUnitOfMeasure.id);
        }
        this.producingUnitOfMeasureChanged(this.currentProducingUnitOfMeasure.id!);
      }
    }
  }

  produceInventory(workOrderNumber : string, productionLine: ProductionLine, unitQuantity: number) : void { 
    this.isSpinning = true;  
    
    const inventoryStatus = this.validInventoryStatuses.find(is => is.id! === this.produceInventoryForm.value.inventoryStatus.value);
 
    const workOrderProduceTransaction : WorkOrderProduceTransaction = { 
        workOrderNumber: workOrderNumber,
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        workOrderLineConsumeTransactions: [],
        workOrderProducedInventories: [
            { 
                lpn: this.produceInventoryForm.value.lpn.value,
                quantity: unitQuantity,
                inventoryStatusId: this.produceInventoryForm.value.inventoryStatus.value,
                inventoryStatus: inventoryStatus,
                itemPackageTypeId: this.produceInventoryForm.value.itemPackageType.value,
                itemPackageType: this.currentProducingItemPackageType
            }
        ],
        consumeByBomQuantity: false,
        workOrderByProductProduceTransactions: [],
        workOrderKPITransactions: [],
        productionLine: productionLine,  
    };
    
    this.saveWorkOrderProduceResults(workOrderProduceTransaction); 
 

  }
  saveWorkOrderProduceResults(workOrderProduceTransaction: WorkOrderProduceTransaction): void {
     
    this.workOrderProduceTransactionService.saveWorkOrderProduceTransaction(workOrderProduceTransaction).subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi('message.work-order.produced-success')); 
          this.produceInventoryModal.destroy(); 
          this.isSpinning = false;  
          // we may need to refresh the production line to reflect the result
          this.refreshProductionLine(workOrderProduceTransaction.productionLine!);
        },
        error: () => {
          this.messageService.error("can't produce the inventory from the work order")
          this.isSpinning = false;
        }

    });
  }

  refreshProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.getProductionLine(productionLine.id!).subscribe({
        next: (productionLineRes) => {
          this.productionLines.filter(productionLine => productionLineRes.id! === productionLine.id!)
          .forEach(productionLine => productionLine.assignedWorkOrders = productionLineRes.assignedWorkOrders);

        }
    })
  }
}
