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
import { InboundReceivingConfiguration } from '../models/inbound-receiving-configuration';
import { InboundReceivingConfigurationService } from '../services/inbound-receiving-configuration.service';

@Component({
    selector: 'app-inbound-inbound-receiving-configuration',
    templateUrl: './inbound-receiving-configuration.component.html',
    styleUrls: ['./inbound-receiving-configuration.component.less'],
    standalone: false
})
export class InboundInboundReceivingConfigurationComponent implements OnInit {

  displayOnly = false;
  constructor( 
              private fb: UntypedFormBuilder,
              @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
              private inboundReceivingConfigurationService: InboundReceivingConfigurationService,
              private router: Router,
              private supplierService: SupplierService, 
              private userService: UserService,
              ) { 
                
      userService.isCurrentPageDisplayOnly("/inbound/inbound-receiving-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                

  }

  inboundReceivingConfigurations: InboundReceivingConfiguration[] = [];
  
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
    this.inboundReceivingConfigurations = [];
    

  }
  
  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.searchForm.controls.item.setValue(selectedItemName);
    
    
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';

    this.inboundReceivingConfigurationService.getInboundReceivingConfigurations(
      this.searchForm!.controls.supplier.value,
      undefined,
      this.searchForm.controls.item.value,
    ).subscribe({
         next: (inboundReceivingConfigurationRes) => {
            this.inboundReceivingConfigurations = inboundReceivingConfigurationRes; 
  
            
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: inboundReceivingConfigurationRes.length,
            });
         }, 
         error: () => {

          this.isSpinning = false;
          this.searchResult = '';
         }

    }); 
  }
  
  @ViewChild('inboundReceivingConfigurationTable', { static: true })
  inboundReceivingConfigurationTable!: STComponent;
  inboundReceivingConfigurationTableColumns: STColumn[] = [
    
    { title: this.i18n.fanyi("warehouse"), index: 'warehouse.name', iif: () => this.isChoose('warehouse') },
    { title: this.i18n.fanyi("supplier"), index: 'supplier.description', iif: () => this.isChoose('supplier') },
    { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName')  },
    { title: this.i18n.fanyi("description"), index: 'item.description', iif: () => this.isChoose('itemDescription')  },
    { title: this.i18n.fanyi("item-family"), index: 'itemFamily.name', iif: () => this.isChoose('itemFamily')  },
    { title: this.i18n.fanyi("standardPalletSize"), index: 'standardPalletSize', iif: () => this.isChoose('standardPalletSize')  },
    { title: this.i18n.fanyi("estimatePalletCountBySize"), index: 'estimatePalletCountBySize', iif: () => this.isChoose('estimatePalletCountBySize')  },
    { title: this.i18n.fanyi("estimatePalletCountByReceiptLineCubicMeter"), index: 'estimatePalletCountByReceiptLineCubicMeter', 
        iif: () => this.isChoose('estimatePalletCountByReceiptLineCubicMeter')  },
    { title: this.i18n.fanyi("statusAllowReceiptChangeWhenUploadFile"), index: 'statusAllowReceiptChangeWhenUploadFile', 
      iif: () => this.isChoose('statusAllowReceiptChangeWhenUploadFile')  },
    { title: this.i18n.fanyi("statusAllowReceiptChangeFromIntegration"), index: 'statusAllowReceiptChangeFromIntegration', 
        iif: () => this.isChoose('statusAllowReceiptChangeFromIntegration')  },
    { title: this.i18n.fanyi("statusAllowReceiptChangeFromWebUI"), index: 'statusAllowReceiptChangeFromWebUI', 
        iif: () => this.isChoose('statusAllowReceiptChangeFromWebUI')  },
    { title: this.i18n.fanyi("useReceiptCheckInTimeAsInWarehouseDateTime"), index: 'useReceiptCheckInTimeAsInWarehouseDateTime', 
        iif: () => this.isChoose('useReceiptCheckInTimeAsInWarehouseDateTime')  },
    { title: this.i18n.fanyi("validateOverReceivingAgainstArrivedQuantity"), index: 'validateOverReceivingAgainstArrivedQuantity', 
        iif: () => this.isChoose('validateOverReceivingAgainstArrivedQuantity')  },
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
    { label: this.i18n.fanyi("standardPalletSize"), value: 'standardPalletSize', checked: true },
    { label: this.i18n.fanyi("estimatePalletCountBySize"), value: 'estimatePalletCountBySize', checked: true },
    { label: this.i18n.fanyi("estimatePalletCountByReceiptLineCubicMeter"), value: 'estimatePalletCountByReceiptLineCubicMeter', checked: true },
    { label: this.i18n.fanyi("statusAllowReceiptChangeWhenUploadFile"), value: 'statusAllowReceiptChangeWhenUploadFile', checked: true },
    { label: this.i18n.fanyi("statusAllowReceiptChangeFromIntegration"), value: 'statusAllowReceiptChangeFromIntegration', checked: true },
    { label: this.i18n.fanyi("statusAllowReceiptChangeFromWebUI"), value: 'statusAllowReceiptChangeFromWebUI', checked: true },
    { label: this.i18n.fanyi("useReceiptCheckInTimeAsInWarehouseDateTime"), value: 'useReceiptCheckInTimeAsInWarehouseDateTime', checked: true },
    { label: this.i18n.fanyi("validateOverReceivingAgainstArrivedQuantity"), value: 'validateOverReceivingAgainstArrivedQuantity', checked: true },
    
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.inboundReceivingConfigurationTable !== undefined && this.inboundReceivingConfigurationTable.columns !== undefined) {
      this.inboundReceivingConfigurationTable!.resetColumns({ emitReload: true });

    }
  }

  modifyInboundReceivingConfiguration(inboundReceivingConfiguration: InboundReceivingConfiguration) {
    // flow to maintenance page to modify the configuration
    this.router.navigateByUrl(
      `/inbound/inbound-receiving-configuration/maintenance?id=${inboundReceivingConfiguration.id}`);
  }
  removeInboundReceivingConfiguration(inboundReceivingConfiguration: InboundReceivingConfiguration) { 
    this.isSpinning = true;
    this.inboundReceivingConfigurationService
      .removeInboundReceivingConfiguration(inboundReceivingConfiguration)
      .subscribe({
        next: () => {
          this.isSpinning = false;
          this.search();

        }, 
        error: () =>  this.isSpinning = false
      });
  }

}
