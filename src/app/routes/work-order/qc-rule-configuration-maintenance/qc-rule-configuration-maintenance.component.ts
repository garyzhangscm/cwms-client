import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder , FormGroup } from '@angular/forms';
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
import { QCRule } from '../../qc/models/qc-rule';
import { QCRuleConfiguration } from '../../qc/models/qc-rule-configuration';
import { QcRuleConfigurationService } from '../../qc/services/qc-rule-configuration.service';
import { QcRuleService } from '../../qc/services/qc-rule.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { WorkOrderQcRuleConfiguration } from '../models/work-order-qc-rule-configuration';
import { WorkOrderQcRuleConfigurationRule } from '../models/work-order-qc-rule-configuration-rule';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderQcRuleConfigurationService } from '../services/work-order-qc-rule-configuration.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-qc-rule-configuration-maintenance',
  templateUrl: './qc-rule-configuration-maintenance.component.html',
})
export class WorkOrderQcRuleConfigurationMaintenanceComponent implements OnInit {
 
  
  qcRuleList: TransferItem[] = [];
  allQCRules: QCRule[] = [];
  assignedQCRuleIds: number[] = [];
  unassignedQCRuleText: string = "";
  assignedQCRuleText: string = "";
  
  stepIndex = 0;
  pageTitle: string = "";
  newQCRuleConfiguration = true;
  isSpinning = false; 
  validproductionLines: ProductionLine[] = [];  
  currentQCRuleConfiguration!: WorkOrderQcRuleConfiguration;


  constructor(private http: _HttpClient,
    private companyService: CompanyService,
    private fb: FormBuilder,
    private workOrderQcRuleConfigurationService: WorkOrderQcRuleConfigurationService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService, 
    private productionLineService: ProductionLineService,
    private workOrderService: WorkOrderService,
    private qcRuleService: QcRuleService,
    private activatedRoute: ActivatedRoute) {

    this.pageTitle = this.i18n.fanyi('menu.main.work-order.qc-rule-config');
    this.currentQCRuleConfiguration = this.createEmptyQcRuleConfiguration();
 
  }
  
  createEmptyQcRuleConfiguration(): WorkOrderQcRuleConfiguration {
    return {  
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
   
      workOrderQCRuleConfigurationRules: [], 
    }
  }


  ngOnInit(): void {

     
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) { 
        this.workOrderQcRuleConfigurationService.getQCRuleConfiguration(params.id)
          .subscribe(qcRuleConfiguration => {
             this.currentQCRuleConfiguration = qcRuleConfiguration;
             this.newQCRuleConfiguration = false;
             this.loadQCRules();
            
          });
      }
      else {
        
        this.newQCRuleConfiguration = true;
        this.loadQCRules();
      }
    });
    
    this.loadProductionLines();

}

loadProductionLines() {

  this.productionLineService.getProductionLines().subscribe(
  {
    next: (productionLineRes) => this.validproductionLines = productionLineRes 
  });

}


loadQCRules() {

  this.qcRuleService.getQCRules().subscribe({
    next: (qcRuleRes) =>  {
      this.allQCRules = qcRuleRes;
      this.qcRuleList = [];
      this.assignedQCRuleIds = [];
      this.allQCRules.forEach(qcRule => {
        const qcRuleAssigned = 
            this.currentQCRuleConfiguration!.workOrderQCRuleConfigurationRules!.some(workOrderQCRuleConfigurationRule => {
              console.log(`workOrderQCRuleConfigurationRule.qcRuleId: ${workOrderQCRuleConfigurationRule.qcRuleId}`);
              console.log(`qcRule.id: ${qcRule.id}`);
              return workOrderQCRuleConfigurationRule.qcRuleId === qcRule.id!
            }
        )
 
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


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    
    if (this.newQCRuleConfiguration) {

      this.workOrderQcRuleConfigurationService.addQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.router.navigateByUrl(`/work-order/qc-rule-configuration`);
            }, 2500);
          },
          error: () => this.isSpinning = false


        }); 
    }
    else {
      

      this.workOrderQcRuleConfigurationService.changeQCRuleConfiguration(this.currentQCRuleConfiguration)
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.router.navigateByUrl(`/work-order/qc-rule-configuration`);
            }, 2500);
          },
          error: () => this.isSpinning = false


        }); 
        
    }
  }

  productionLineChanged(id: number) {
    console.log(`production line is changed to id ${id}`);
    
    this.currentQCRuleConfiguration.productionLine =
        this.validproductionLines.find(
          productionLine => productionLine.id === id
        );
  }
  
  wrokOrderChanged(event: Event) {
    const workOrderNumber = (event.target as HTMLInputElement).value.trim();
    if (workOrderNumber.length > 0) {

      this.workOrderService.getWorkOrders(workOrderNumber).subscribe(
        {
          next: (workOrderRes) => {
            if (workOrderRes.length === 1) {
              console.log(`workOrder is changed to ${workOrderRes[0].number}`);
              this.currentQCRuleConfiguration.workOrder = workOrderRes[0]; 
            }
          }
        }
      )
    }
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
    const listKeys = ret.list.map(l => l.key);
    console.log('listKeys', JSON.stringify(listKeys));

    if (ret.from === 'left' && ret.to === 'right') {
      // assign the qc rule 
      const qcRules: WorkOrderQcRuleConfigurationRule[] = this.allQCRules.filter(
        qcRule => listKeys.some(key => qcRule.id === +key)
      ).map(
        qcRule => {
          return {
            qcRuleId: qcRule.id,
            qcRule: qcRule,
          }
        }
      )
      this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules = [
        ...this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules, ...qcRules
      ];
    }
    else if (ret.from === 'right' && ret.to === 'left') {      
      this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules =  
          this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.filter(
            workOrderQCRuleConfigurationRules => listKeys.some(key => workOrderQCRuleConfigurationRules.qcRule!.id === +key) === false
          ) 
    }
    console.log(`this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.length: \n ${JSON.stringify(this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.length)}`);
    this.currentQCRuleConfiguration.workOrderQCRuleConfigurationRules.forEach(
      assignedQCRule => console.log(`assigned qc rule id: ${assignedQCRule.qcRule?.id} / ${assignedQCRule.qcRule?.name}`)
    )
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("name"), index: 'qcRule.name',   },
    { title: this.i18n.fanyi("description"), index: 'qcRule.description',  }, 

  ];
}
