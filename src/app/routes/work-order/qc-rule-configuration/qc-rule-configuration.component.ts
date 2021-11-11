import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service';
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { QCRuleConfiguration } from '../../qc/models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../../qc/services/qc-rule-configuration.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderQcRuleConfiguration } from '../models/work-order-qc-rule-configuration';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderQcRuleConfigurationService } from '../services/work-order-qc-rule-configuration.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-qc-rule-configuration',
  templateUrl: './qc-rule-configuration.component.html',
  styleUrls: ['./qc-rule-configuration.component.less'],
})
export class WorkOrderQcRuleConfigurationComponent implements OnInit {
  constructor(private http: _HttpClient,    
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService,
    private workOrderQcRuleConfigurationService: WorkOrderQcRuleConfigurationService,
    private router: Router,
    private productionLineService: ProductionLineService,
    
    ) { 

}

listOfAllQCRuleConfiguration: WorkOrderQcRuleConfiguration[] = [];

searchResult = '';
isSpinning = false;
searchForm!: FormGroup;
validproductionLines: ProductionLine[] = []; 

ngOnInit(): void { 

  this.searchForm = this.fb.group({
    productionLine: [null],
    workOrder: [null],
  });
  this.loadProductionLines(); 

}

loadProductionLines() {

  this.productionLineService.getProductionLines().subscribe(
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
    this.searchForm!.controls.workOrder.value,
    this.searchForm!.controls.productionLine.value, 
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
 
{ title: this.i18n.fanyi("work-order"), index: 'workOrder.number', iif: () => this.isChoose('workOrder') },
{ title: this.i18n.fanyi("production-line"), index: 'productionLine.name', iif: () => this.isChoose('productionLine') }, 
{ title: this.i18n.fanyi("qc-quantity"), index: 'qcQuantity', iif: () => this.isChoose('qcQuantity') }, 
{
  title: 'action',
  renderTitle: 'actionColumnTitle',fixed: 'right',width: 110, 
  render: 'actionColumn',
},

];
customColumns = [
 
{ label: this.i18n.fanyi("work-order"), value: 'workOrder', checked: true },
{ label: this.i18n.fanyi("production-line"), value: 'productionLine', checked: true }, 
{ label: this.i18n.fanyi("qc-quantity"), value: 'qcQuantity', checked: true }, 
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
