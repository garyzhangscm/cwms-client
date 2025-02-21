import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 

import { UserService } from '../../auth/services/user.service';
import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service'; 
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service'; 
import { QCRuleConfiguration } from '../models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../services/qc-rule-configuration.service';

@Component({
    selector: 'app-qc-qc-rule-configuration',
    templateUrl: './qc-rule-configuration.component.html',
    styleUrls: ['./qc-rule-configuration.component.less'],
    standalone: false
})
export class QcQcRuleConfigurationComponent implements OnInit {

  displayOnly = false;
  constructor( 
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private qcRuleConfigurationService: QcRuleConfigurationService,
    private router: Router,
    private supplierService: SupplierService, 
    private inventoryStatusService: InventoryStatusService,
    private itemFamilyService: ItemFamilyService,
    private userService: UserService,
    ) { 
      userService.isCurrentPageDisplayOnly("/qc/rules/configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );         

}

listOfAllQCRuleConfiguration: QCRuleConfiguration[] = [];

searchResult = '';
isSpinning = false;
searchForm!: UntypedFormGroup;
validSuppliers: Supplier[] = [];
validItemFamilies: ItemFamily[] = [];
validInventoryStatus: InventoryStatus[] = [];

ngOnInit(): void { 

  this.searchForm = this.fb.group({
    supplier: [null],
    itemFamily: [null],
    item: [null],
    inventoryStatus: [null],
  });
  this.loadSuppliers();
  this.loadItemFamlies();
  this.loadInventoryStatus();

}

loadSuppliers() {

  this.supplierService.loadSuppliers().subscribe(
  {
    next: (supplierRes) => this.validSuppliers = supplierRes 
  });

}
loadItemFamlies() {

  this.itemFamilyService.loadItemFamilies().subscribe(
  {
    next: (itemFamilyRes) => this.validItemFamilies = itemFamilyRes 
  });

}
loadInventoryStatus() {
  
  this.inventoryStatusService.loadInventoryStatuses().subscribe(
    {
      next: (inventoryStatusRes) => this.validInventoryStatus = inventoryStatusRes 
    });
}

resetForm(): void {
  this.searchForm.reset();
  this.listOfAllQCRuleConfiguration = [];


}

processItemQueryResult(selectedItemName: any): void {
  console.log(`start to query with item name ${selectedItemName}`);
  this.searchForm.value.item.setValue(selectedItemName);

}

search(): void {
  this.isSpinning = true;
  this.searchResult = '';
  this.qcRuleConfigurationService.getQCRuleConfigurations(
    undefined,
    this.searchForm!.value.item.value,
    this.searchForm!.value.itemFamily.value,
    this.searchForm!.value.inventoryStatus.value,
    this.searchForm.value.supplier.value,
  ).subscribe({
    next: (qcRuleConfigurationRes) => {
      this.listOfAllQCRuleConfiguration = qcRuleConfigurationRes; 
 
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: qcRuleConfigurationRes.length,
        });
      }, 
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';

      }
  });
    
}

@ViewChild('st', { static: true })
st!: STComponent;
columns: STColumn[] = [
 
{ title: this.i18n.fanyi("supplier"), index: 'supplier.description', iif: () => this.isChoose('supplier') },
{ title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName')  },
{ title: this.i18n.fanyi("description"), index: 'item.description', iif: () => this.isChoose('itemDescription')  },
{ title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('itemFamily')  },
{ title: this.i18n.fanyi("inventory-status"), index: 'inventoryStatus.name', iif: () => this.isChoose('inventoryStatus')  }, 
{
  title: 'action',
  renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
  render: 'actionColumn',
  iif: () => !this.displayOnly
},

];
customColumns = [
 
{ label: this.i18n.fanyi("supplier"), value: 'supplier', checked: true },
{ label: this.i18n.fanyi("itemName"), value: 'itemName', checked: true },
{ label: this.i18n.fanyi("description"), value: 'itemDescription', checked: true },
{ label: this.i18n.fanyi("item-family"), value: 'itemFamily', checked: true },
{ label: this.i18n.fanyi("inventory-status"), value: 'inventoryStatus', checked: true }, 
];

isChoose(key: string): boolean {
  return !!this.customColumns.find(w => w.value === key && w.checked);
}

columnChoosingChanged(): void{ 
  if (this.st !== undefined && this.st.columns !== undefined) {
    this.st!.resetColumns({ emitReload: true });

  }
}

modifyQCRuleConfiguration(qcRuleConfiguration: QCRuleConfiguration) {
  // flow to maintenance page to modify the configuration
  this.router.navigateByUrl(
  `/qc/qc-rule-configuration/maintenance?id=${qcRuleConfiguration.id}`);
}
removeQCRuleConfiguration(qcRuleConfiguration: QCRuleConfiguration) { 
  this.isSpinning = true;
  this.qcRuleConfigurationService
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
