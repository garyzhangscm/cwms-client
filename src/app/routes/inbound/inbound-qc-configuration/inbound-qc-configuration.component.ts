/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
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
import { InboundQcConfiguration } from '../models/inbound-qc-configuration';
import { InboundQcConfigurationService } from '../services/inbound-qc-configuration.service';

@Component({
    selector: 'app-inbound-inbound-qc-configuration',
    templateUrl: './inbound-qc-configuration.component.html',
    styleUrls: ['./inbound-qc-configuration.component.less'],
    standalone: false
})
export class InboundInboundQcConfigurationComponent implements OnInit {

  displayOnly = false;
  constructor( 
              private fb: UntypedFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
              private inboundQCConfigurationService: InboundQcConfigurationService,
              private router: Router,
              private supplierService: SupplierService, 
              private userService: UserService,
              ) { 
                
      userService.isCurrentPageDisplayOnly("/inbound/inbound-qc-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                

  }

  listOfAllQCConfiguration: InboundQcConfiguration[] = [];
  
  searchResult = '';
  isSpinning = false;
  searchForm!: UntypedFormGroup;
  validSuppliers: Supplier[] = [];

  ngOnInit(): void { 
    
    this.searchForm = this.fb.group({
      supplier: [null],
      item: [null],
    });
    this.loadSuppliers();

  }

  loadSuppliers() {

    this.supplierService.loadSuppliers().subscribe(
      {
        next: (supplierRes) => this.validSuppliers = supplierRes 
      }
    );

  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllQCConfiguration = [];
    

  }
  
  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.value.item.setValue(selectedItemName);
    
    
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.inboundQCConfigurationService.getInboundQcConfigurations(
      this.searchForm!.controls.supplier.value,
      undefined,
      this.searchForm.controls.item.value,
    ).subscribe(
      qcConfigurationRes => {
        this.listOfAllQCConfiguration = qcConfigurationRes; 
 
        console.log(`====  listOfAllQCConfiguration   ==== \n ${JSON.stringify(this.listOfAllQCConfiguration)}`)
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: qcConfigurationRes.length,
        });
        
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }
  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("warehouse"), index: 'warehouse.name', iif: () => this.isChoose('warehouse') },
    { title: this.i18n.fanyi("supplier"), index: 'supplier.description', iif: () => this.isChoose('supplier') },
    { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName')  },
    { title: this.i18n.fanyi("description"), index: 'item.description', iif: () => this.isChoose('itemDescription')  },
    { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('itemFamily')  },
    { title: this.i18n.fanyi("qc-configuration.by-quantity"), index: 'qcQuantityPerReceipt', iif: () => this.isChoose('qcQuantityPerReceipt')  },
    { title: this.i18n.fanyi("qc-configuration.by-percentage"), index: 'qcPercentage', iif: () => this.isChoose('qcPercentage')  },
    { title: this.i18n.fanyi("from-inventory-status"), index: 'fromInventoryStatus.name', iif: () => this.isChoose('fromInventoryStatus')  },
    { title: this.i18n.fanyi("to-inventory-status"), index: 'toInventoryStatus.name', iif: () => this.isChoose('toInventoryStatus') },
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 150, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("warehouse"), value: 'warehouse', checked: true },
    { label: this.i18n.fanyi("supplier"), value: 'supplier', checked: true },
    { label: this.i18n.fanyi("itemName"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("description"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("item-family"), value: 'itemFamily', checked: true }, 
    { label: this.i18n.fanyi("qc-configuration.by-quantity"), value: 'qcQuantityPerReceipt', checked: true },
    { label: this.i18n.fanyi("qc-configuration.by-percentage"), value: 'qcPercentage', checked: true },
    { label: this.i18n.fanyi("from-inventory-status"), value: 'fromInventoryStatus', checked: true },
    { label: this.i18n.fanyi("to-inventory-status"), value: 'toInventoryStatus', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  modifyQCConfiguration(qcConfiguration: InboundQcConfiguration) {
    // flow to maintenance page to modify the configuration
    this.router.navigateByUrl(
      `/inbound/inbound-qc-configuration/maintenance?id=${qcConfiguration.id}`);
  }
  removeQCConfiguration(qcConfiguration: InboundQcConfiguration) { 
    this.isSpinning = true;
    this.inboundQCConfigurationService
      .removeInboundQcConfiguration(qcConfiguration)
      .subscribe({
        next: () => {
          this.isSpinning = false;
          this.search();

        }, 
        error: () =>  this.isSpinning = false
      });
  }
   
}
