import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Customer } from '../../common/models/customer'; 
import { InventoryLock } from '../../inventory/models/inventory-lock';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { Item } from '../../inventory/models/item';
import { ItemFamily } from '../../inventory/models/item-family'; 
import { Order } from '../../outbound/models/order';
import { OrderService } from '../../outbound/services/order.service';
import { QCRuleConfiguration } from '../../qc/models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../../qc/services/qc-rule-configuration.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderQcRuleConfiguration } from '../models/work-order-qc-rule-configuration';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderQcRuleConfigurationService } from '../services/work-order-qc-rule-configuration.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-qc-rule-configuration',
    templateUrl: './qc-rule-configuration.component.html',
    styleUrls: ['./qc-rule-configuration.component.less'],
    standalone: false
})
export class WorkOrderQcRuleConfigurationComponent implements OnInit {
  
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private workOrderQcRuleConfigurationService: WorkOrderQcRuleConfigurationService, 
    private localCacheService: LocalCacheService, 
    private orderService: OrderService, 
    private userService: UserService,
    private router: Router,
    private productionLineService: ProductionLineService,
    
    ) { 
      userService.isCurrentPageDisplayOnly("/work-order/qc-rule-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                              

}

listOfAllQCRuleConfiguration: WorkOrderQcRuleConfiguration[] = [];

searchResult = '';
isSpinning = false;
searchForm!: UntypedFormGroup;
validproductionLines: ProductionLine[] = []; 
loadingQCConfigurationDetailsRequest = 0;

ngOnInit(): void { 

  this.searchForm = this.fb.group({
    productionLine: [null],
    workOrder: [null],
  });
  this.loadProductionLines(); 

}

loadProductionLines() {

  this.productionLineService.getProductionLines(undefined, undefined, false, false).subscribe(
  {
    next: (productionLineRes) => this.validproductionLines = productionLineRes 
  });

}


resetForm(): void {
  this.searchForm.reset();
  this.listOfAllQCRuleConfiguration = [];


}


search(): void {
  this.isSpinning = true;
  this.searchResult = '';
  this.workOrderQcRuleConfigurationService.getQCRuleConfigurations(
    undefined,
    this.searchForm!.value.workOrder,
    this.searchForm!.value.productionLine, 
  ).subscribe({
    next: (qcRuleConfigurationRes) => {
      this.listOfAllQCRuleConfiguration = qcRuleConfigurationRes; 
 
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: qcRuleConfigurationRes.length,
        });
        this.refreshDetailInformations(this.listOfAllQCRuleConfiguration);
      }, 
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';

      }
  });
    
}

// we will load the item / order / customer / etc
  // asyncronized
  async refreshDetailInformations(workOrderQcRuleConfigurationList: WorkOrderQcRuleConfiguration[]) { 
    let index = 0;
    while (index < workOrderQcRuleConfigurationList.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 WorkOrderQcRuleConfiguration at a time(each WorkOrderQcRuleConfiguration may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      
      while(this.loadingQCConfigurationDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      this.refreshDetailInformation(workOrderQcRuleConfigurationList[index]);
      index++;
    }
    
    while(this.loadingQCConfigurationDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    } 
    // refresh the table while everything is loaded
    console.log(`refresh the table`);  
    this.st.reload();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  refreshDetailInformation(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration) {
  
    this.loadWarehouse(workOrderQcRuleConfiguration); 

    this.loadOrder(workOrderQcRuleConfiguration); 
   
    this.loadCustomer(workOrderQcRuleConfiguration); 
    
    this.loadItem(workOrderQcRuleConfiguration); 
    
    this.loadItemFamily(workOrderQcRuleConfiguration); 

    this.loadInventoryStatus(workOrderQcRuleConfiguration);

    this.loadInventoryLock(workOrderQcRuleConfiguration);
 
  }

  loadWarehouse(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.warehouseId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getWarehouse(workOrderQcRuleConfiguration.warehouseId)
      .subscribe((warehouse: Warehouse) => {

        workOrderQcRuleConfiguration.warehouse = warehouse;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }
  }
  loadOrder(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.outboundOrderId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.orderService
      .getOrder(workOrderQcRuleConfiguration.outboundOrderId)
      .subscribe((order: Order) => {

        workOrderQcRuleConfiguration.outboundOrder = order;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }}
  loadCustomer(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.customerId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getCustomer(workOrderQcRuleConfiguration.customerId)
      .subscribe((customer: Customer) => {

        workOrderQcRuleConfiguration.customer = customer;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }}
  loadItem(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.itemId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getItem(workOrderQcRuleConfiguration.itemId)
      .subscribe((item: Item) => {

        workOrderQcRuleConfiguration.item = item;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }}
  loadItemFamily(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.itemFamilyId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getItemFamily(workOrderQcRuleConfiguration.itemFamilyId)
      .subscribe((itemFamily: ItemFamily) => {

        workOrderQcRuleConfiguration.itemFamily = itemFamily;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }}
  loadInventoryStatus(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.fromInventoryStatusId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getInventoryStatus(workOrderQcRuleConfiguration.fromInventoryStatusId)
      .subscribe((inventoryStatus: InventoryStatus) => {

        workOrderQcRuleConfiguration.fromInventoryStatus = inventoryStatus;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }
    if (workOrderQcRuleConfiguration.toInventoryStatusId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getInventoryStatus(workOrderQcRuleConfiguration.toInventoryStatusId)
      .subscribe((inventoryStatus: InventoryStatus) => {

        workOrderQcRuleConfiguration.toInventoryStatus = inventoryStatus;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }

  }
  loadInventoryLock(workOrderQcRuleConfiguration: WorkOrderQcRuleConfiguration){
    if (workOrderQcRuleConfiguration.inventoryLockId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getInventoryLock(workOrderQcRuleConfiguration.inventoryLockId)
      .subscribe((inventoryLock: InventoryLock) => {

        workOrderQcRuleConfiguration.inventoryLock = inventoryLock;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }
    if (workOrderQcRuleConfiguration.futureInventoryLockId) {

      this.loadingQCConfigurationDetailsRequest++;
      this.localCacheService
      .getInventoryLock(workOrderQcRuleConfiguration.futureInventoryLockId)
      .subscribe((inventoryLock: InventoryLock) => {

        workOrderQcRuleConfiguration.futureInventoryLock = inventoryLock;
        this.loadingQCConfigurationDetailsRequest--;
      });
    }

  }
  
@ViewChild('st', { static: true })
st!: STComponent;
columns: STColumn[] = [
 // Used by QC by sampling
{ title: this.i18n.fanyi("work-order"), index: 'workOrder.number', iif: () => this.isChoose('workOrder'), width: "100px"},
{ title: this.i18n.fanyi("production-line"), index: 'productionLine.name', iif: () => this.isChoose('productionLine'), width: "150px"}, 
{ title: this.i18n.fanyi("qc-quantity"), index: 'qcQuantity', iif: () => this.isChoose('qcQuantity'), width: "100px" }, 
// used by qc by work order
{ title: this.i18n.fanyi("warehouse"), 
    render: 'warehouse', iif: () => this.isChoose('warehouse'), width: "120px"}, 
{ title: this.i18n.fanyi("item.name"),  
    render: 'itemName', iif: () => this.isChoose('itemName'), width: "100px"}, 
{ title: this.i18n.fanyi("item.description"),   
    render: 'itemDescription',  iif: () => this.isChoose('itemDescription'), width: "150px"}, 
{ title: this.i18n.fanyi("item-family"),   
    render: 'itemFamily',  iif: () => this.isChoose('itemFamily'), width: "100px"}, 
{ title: this.i18n.fanyi("customer"),   
    render: 'btoCustomer',  iif: () => this.isChoose('btoCustomer'), width: "100px"}, 
{ title: this.i18n.fanyi("order"),   
    render: 'btoOrder',  iif: () => this.isChoose('btoOrder'), width: "100px"}, 
{ title: this.i18n.fanyi("qc-configuration.by-quantity"), index: 'qcQuantityPerWorkOrder', 
    iif: () => this.isChoose('qcQuantityPerWorkOrder') , width: "100px"}, 
{ title: this.i18n.fanyi("qc-configuration.by-percentage"), index: 'qcPercentagePerWorkOrder', 
    iif: () => this.isChoose('qcPercentagePerWorkOrder'), width: "150px" }, 
{ title: this.i18n.fanyi("from-inventory-status"),    
    render: 'fromInventoryStatus',  iif: () => this.isChoose('fromInventoryStatus'), width: "100px" }, 
{ title: this.i18n.fanyi("to-inventory-status"),    
    render: 'toInventoryStatus',  iif: () => this.isChoose('toInventoryStatus'), width: "100px" }, 
{ title: this.i18n.fanyi("inventoryLock"),    
    render: 'inventoryLock',  iif: () => this.isChoose('inventoryLock'), width: "100px" }, 
{ title: this.i18n.fanyi("futureInventoryLock"),    
    render: 'futureInventoryLock', iif: () => this.isChoose('futureInventoryLock'), width: "150px" }, 
{
  title: 'action',
  renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
  render: 'actionColumn',
  iif: () => !this.displayOnly
},

];
customColumns = [
 
 // Used by QC by sampling
{ label: this.i18n.fanyi("work-order"), value: 'workOrder', checked: true },
{ label: this.i18n.fanyi("production-line"), value: 'productionLine', checked: true },
{ label: this.i18n.fanyi("qc-quantity"), value: 'qcQuantity', checked: true },

// used by qc by work order

{ label: this.i18n.fanyi("warehouse"), value: 'warehouse', checked: true },
{ label: this.i18n.fanyi("item.name"), value: 'itemName', checked: true }, 
{ label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true }, 


{ label: this.i18n.fanyi("item-family"), value: 'itemFamily', checked: true }, 
{ label: this.i18n.fanyi("customer"), value: 'btoCustomer', checked: true }, 
{ label: this.i18n.fanyi("order"), value: 'btoOrder', checked: true }, 
{ label: this.i18n.fanyi("qc-configuration.by-quantity"), value: 'qcQuantityPerWorkOrder', checked: true }, 
{ label: this.i18n.fanyi("qc-configuration.by-percentage"), value: 'qcPercentagePerWorkOrder', checked: true }, 
{ label: this.i18n.fanyi("from-inventory-status"), value: 'fromInventoryStatus', checked: true }, 
{ label: this.i18n.fanyi("to-inventory-status"), value: 'toInventoryStatus', checked: true }, 
{ label: this.i18n.fanyi("inventoryLock"), value: 'inventoryLock', checked: true }, 
{ label: this.i18n.fanyi("futureInventoryLock"), value: 'futureInventoryLock', checked: true }, 
];

isChoose(key: string): boolean {
  return !!this.customColumns.find(w => w.value === key && w.checked);
}

columnChoosingChanged(): void{ 
  if (this.st !== undefined && this.st.columns !== undefined) {
    this.st!.resetColumns({ emitReload: true });

  }
}

modifyQCRuleConfiguration(qcRuleConfiguration: WorkOrderQcRuleConfiguration) {
  // flow to maintenance page to modify the configuration
  this.router.navigateByUrl(
  `/work-order/qc-rule-configuration/maintenance?id=${qcRuleConfiguration.id}`);
}
removeQCRuleConfiguration(qcRuleConfiguration: WorkOrderQcRuleConfiguration) { 
  this.isSpinning = true;
  this.workOrderQcRuleConfigurationService
  .removeQCRuleConfiguration(qcRuleConfiguration)
    .subscribe({
      next: () => {
        this.isSpinning = false;
        this.search();

      }, 
      error: () =>  this.isSpinning = false
  });
}

}
