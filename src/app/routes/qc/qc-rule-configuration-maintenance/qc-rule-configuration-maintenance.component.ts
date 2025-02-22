import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange, TransferItem } from 'ng-zorro-antd/transfer';

import { Supplier } from '../../common/models/supplier';
import { SupplierService } from '../../common/services/supplier.service'; 
import { InventoryStatus } from '../../inventory/models/inventory-status';
import { ItemFamily } from '../../inventory/models/item-family';
import { InventoryStatusService } from '../../inventory/services/inventory-status.service';
import { ItemFamilyService } from '../../inventory/services/item-family.service';
import { ItemService } from '../../inventory/services/item.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QCRule } from '../models/qc-rule';
import { QCRuleConfiguration } from '../models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../services/qc-rule-configuration.service';
import { QcRuleService } from '../services/qc-rule.service';

@Component({
    selector: 'app-qc-qc-rule-configuration-maintenance',
    templateUrl: './qc-rule-configuration-maintenance.component.html',
    standalone: false
})
export class QcQcRuleConfigurationMaintenanceComponent implements OnInit {

  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  qcRuleList: TransferItem[] = [];
  allQCRules: QCRule[] = [];
  assignedQCRuleIds: number[] = [];
  unassignedQCRuleText: string = "";
  assignedQCRuleText: string = "";


  currentQCRuleConfiguration!: QCRuleConfiguration;
  stepIndex = 0;
  pageTitle: string = "";
  newQCRuleConfiguration = true;
  isSpinning = false;
  validSuppliers: Supplier[] = [];
  validItemFamilies: ItemFamily[] = [];
  validInventoryStatus: InventoryStatus[] = [];  


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private qcRuleConfigurationService: QcRuleConfigurationService,
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService,
    private itemService: ItemService,
    private supplierService: SupplierService,
    private itemFamilyService: ItemFamilyService, 
    private inventoryStatusService: InventoryStatusService, 
    private qcRuleService: QcRuleService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.qc.qc-rule-configuration');

    this.currentQCRuleConfiguration = this.createEmptyQcRuleConfiguration();
  }

  createEmptyQcRuleConfiguration(): QCRuleConfiguration {
    return {  
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
  
      warehouse: this.warehouseService.getCurrentWarehouse(), 
   
      qcRules: [],
    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) { 
        this.qcRuleConfigurationService.getQCRuleConfiguration(params['id'])
          .subscribe(qcRuleConfiguration => {
            this.currentQCRuleConfiguration = qcRuleConfiguration;

            this.newQCRuleConfiguration = false;
            
          });
      }
      else {
        
        this.newQCRuleConfiguration = true;
      }
    });
    this.loadSuppliers();
    this.loadItemFamlies();
    
    this.loadInventoryStatus();
    this.loadQCRules();

}

loadQCRules() {

  this.qcRuleService.getQCRules().subscribe({
    next: (qcRuleRes) =>  {
      this.allQCRules = qcRuleRes;
      this.qcRuleList = [];
      this.assignedQCRuleIds = [];
      this.allQCRules.forEach(qcRule => {
        const qcRuleAssigned = 
            this.currentQCRuleConfiguration!.qcRules!.some(assignedQCRule => assignedQCRule.id === qcRule.id!)
 
        this.qcRuleList.push({
          key: qcRule.id!.toString(),
          title: `${qcRule.name}`,
          description: `${qcRule.description}`,
          direction: qcRuleAssigned ? 'right' : undefined,
        });
      });
    }
  })
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


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    
    if (this.newQCRuleConfiguration) {

      this.qcRuleConfigurationService.addQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/qc/rules/configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.qcRuleConfigurationService.changeQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/qc/rules/configuration`);
            }, 500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }

  supplierChanged(id: number) {
    console.log(`supplier is changed to id ${id}`);
    this.supplierService.getSupplier(id).subscribe({

      next: (supplierRes) => {
        console.log(`supplier is changed to ${supplierRes.name}`);
        this.currentQCRuleConfiguration.supplier = supplierRes;
        this.currentQCRuleConfiguration.supplierId = supplierRes.id;
      }

    })
  }
  
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) {
              console.log(`item is changed to ${itemsRes[0].name}`);
              this.currentQCRuleConfiguration.item = itemsRes[0]; 
            }
          }
        }
      )
    }
  }
  
  itemFamilyChanged(id: number) { 
    console.log(`item family is changed to ${id}`); 
    this.currentQCRuleConfiguration.itemFamily = 
          this.validItemFamilies.find(
            itemFamily => itemFamily.id === +id
          );

          
  }
  
  inventoryStatusChanged(event: Event) {
    const inventoryStatusName = (event.target as HTMLInputElement).value.trim();
    if (inventoryStatusName.length > 0) {

      this.currentQCRuleConfiguration.inventoryStatus = 
          this.validInventoryStatus.find(
            inventoryStatus => inventoryStatus.name === inventoryStatusName
          );
          
    }
  }
  

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentQCRuleConfiguration.item = itemsRes[0];
          }
        }
      }
    )
    
  }
  
  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: TransferChange): void {
    console.log('nzChange', ret);
    const listKeys = ret.list.map(l => l['key']);
    console.log('listKeys', JSON.stringify(listKeys));

    if (ret.from === 'left' && ret.to === 'right') {
      // assign the qc rule 
      const qcRules: QCRule[] = this.allQCRules.filter(
        qcRule => listKeys.some(key => qcRule.id === +key)
      ); 
      this.currentQCRuleConfiguration.qcRules = [
        ...this.currentQCRuleConfiguration.qcRules, ...qcRules
      ];
    }
    else if (ret.from === 'right' && ret.to === 'left') {      
      this.currentQCRuleConfiguration.qcRules =  
          this.currentQCRuleConfiguration.qcRules.filter(
            qcRule => listKeys.some(key => qcRule.id === +key) === false
          ) 
    }
    console.log(`this.currentQCRuleConfiguration.qcRules.length: \n ${JSON.stringify(this.currentQCRuleConfiguration.qcRules.length)}`);
    this.currentQCRuleConfiguration.qcRules.forEach(
      assignedQCRule => console.log(`assigned qc rule id: ${assignedQCRule.id} / ${assignedQCRule.name}`)
    )
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("name"), index: 'name',   },
    { title: this.i18n.fanyi("description"), index: 'description',  }, 

  ];

}
