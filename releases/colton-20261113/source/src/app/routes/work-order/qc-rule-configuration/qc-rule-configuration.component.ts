import { formatDate } from '@angular/common';
import { Observable, finalize, timeout } from 'rxjs';
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
removeMessage = '';
detailLoadWarnings = 0;
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
  this.detailLoadWarnings = 0;
  this.workOrderQcRuleConfigurationService.getQCRuleConfigurations(
    undefined,
    this.searchForm!.value.workOrder,
    this.searchForm!.value.productionLine, 
  ).pipe(timeout(30000), finalize(() => this.isSpinning = false)).subscribe({
    next: (qcRuleConfigurationRes) => {
      this.listOfAllQCRuleConfiguration = qcRuleConfigurationRes; 
 
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: qcRuleConfigurationRes.length,
        });
        this.st?.reload();
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

  private trackDetail<T>(source: Observable<T>, assign: (value: T) => void): void {
    this.loadingQCConfigurationDetailsRequest++;
    source.pipe(timeout(15000), finalize(() => this.loadingQCConfigurationDetailsRequest--))
      .subscribe({next: assign, error: () => this.detailLoadWarnings++});
  }

  loadWarehouse(row: WorkOrderQcRuleConfiguration): void {
    if (row.warehouseId) {
      this.trackDetail<Warehouse>(this.localCacheService.getWarehouse(row.warehouseId), value => row.warehouse = value);
    }
  }

  loadOrder(row: WorkOrderQcRuleConfiguration): void {
    if (row.outboundOrderId) {
      this.trackDetail<Order>(this.orderService.getOrder(row.outboundOrderId), value => row.outboundOrder = value);
    }
  }

  loadCustomer(row: WorkOrderQcRuleConfiguration): void {
    if (row.customerId) {
      this.trackDetail<Customer>(this.localCacheService.getCustomer(row.customerId), value => row.customer = value);
    }
  }

  loadItem(row: WorkOrderQcRuleConfiguration): void {
    if (row.itemId) {
      this.trackDetail<Item>(this.localCacheService.getItem(row.itemId), value => row.item = value);
    }
  }

  loadItemFamily(row: WorkOrderQcRuleConfiguration): void {
    if (row.itemFamilyId) {
      this.trackDetail<ItemFamily>(this.localCacheService.getItemFamily(row.itemFamilyId), value => row.itemFamily = value);
    }
  }

  loadInventoryStatus(row: WorkOrderQcRuleConfiguration): void {
    if (row.fromInventoryStatusId) {
      this.trackDetail<InventoryStatus>(this.localCacheService.getInventoryStatus(row.fromInventoryStatusId), value => row.fromInventoryStatus = value);
    }
    if (row.toInventoryStatusId) {
      this.trackDetail<InventoryStatus>(this.localCacheService.getInventoryStatus(row.toInventoryStatusId), value => row.toInventoryStatus = value);
    }
  }

  loadInventoryLock(row: WorkOrderQcRuleConfiguration): void {
    if (row.inventoryLockId) {
      this.trackDetail<InventoryLock>(this.localCacheService.getInventoryLock(row.inventoryLockId), value => row.inventoryLock = value);
    }
    if (row.futureInventoryLockId) {
      this.trackDetail<InventoryLock>(this.localCacheService.getInventoryLock(row.futureInventoryLockId), value => row.futureInventoryLock = value);
    }
  }

@ViewChild('st', { static: true })
st!: STComponent;
columns: STColumn[] = [
{title: this.i18n.fanyi('qc-config.id'), index: 'id', width: '100px'},
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
  if (this.isSpinning || this.displayOnly || !qcRuleConfiguration.id) return;
  this.isSpinning = true;
  this.removeMessage = '';
  let confirmed = false;
  this.workOrderQcRuleConfigurationService.removeQCRuleConfiguration(qcRuleConfiguration)
    .pipe(timeout(30000), finalize(() => this.isSpinning = false))
    .subscribe({
      next: () => {
        confirmed = true;
        this.listOfAllQCRuleConfiguration = this.listOfAllQCRuleConfiguration
          .filter(row => row.id !== qcRuleConfiguration.id);
        this.st?.reload();
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: this.listOfAllQCRuleConfiguration.length,
        });
        this.removeMessage = this.i18n.fanyi('qc-config.removed', {id: qcRuleConfiguration.id});
      },
      error: () => this.removeMessage = this.i18n.fanyi('qc-config.remove-unknown', {id: qcRuleConfiguration.id}),
      complete: () => {
        if (!confirmed) this.removeMessage = this.i18n.fanyi('qc-config.remove-unknown', {id: qcRuleConfiguration.id});
      }
    });
}

}
