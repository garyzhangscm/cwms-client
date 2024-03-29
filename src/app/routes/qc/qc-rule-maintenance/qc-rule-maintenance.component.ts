import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Customer } from '../../common/models/customer';
import { AllocationStrategyType } from '../../outbound/models/allocation-strategy-type.enum';
import { Order } from '../../outbound/models/order';
import { OrderLine } from '../../outbound/models/order-line';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QCRule } from '../models/qc-rule';
import { QCRuleItem } from '../models/qc-rule-item';
import { QCRuleItemComparator } from '../models/qc-rule-item-comparator';
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcRuleService } from '../services/qc-rule.service';

import { Address } from 'cluster';

@Component({
  selector: 'app-qc-qc-rule-maintenance',
  templateUrl: './qc-rule-maintenance.component.html',
})
export class QcQcRuleMaintenanceComponent implements OnInit {
  qcRuleItemTypes = QCRuleItemType;
  qcRuleItemComparators = QCRuleItemComparator;

  currentQCRule?: QCRule;
  pageTitle: string;
  newQCRule = true;  
  
  qcRuleValidateStatus = 'warning'; 


  stepIndex = 0; 
  isSpinning = false; 

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private qcRuleService: QcRuleService, 
    private router: Router, ) { 

    this.pageTitle = this.i18n.fanyi('menu.main.qc.qc-rule-maintenance');
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.qcRuleService.getQCRule(params.id)
          .subscribe(qcRuleRes => {
            this.currentQCRule = qcRuleRes; 
            this.qcRuleValidateStatus = 'success'; 

            this.newQCRule = false;
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine();
        this.currentQCRule = this.getEmptyQCRule();
        this.newQCRule = true;
      }
    });
    
  } 
  getEmptyQCRule() : QCRule {
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
  
      name: "",
      description: "",
      qcRuleItems: [],
 
    }
  } 
 
  
  addExtraQCRuleItem(): void {
    this.currentQCRule!.qcRuleItems = [...this.currentQCRule!.qcRuleItems, this.getEmptyQCRuleItem()];
    console.log(`add an extra qc item, now we have ${this.currentQCRule!.qcRuleItems.length} rules`);
  }

  getEmptyQCRuleItem(): QCRuleItem {
    return {
      id: undefined,   
      checkPoint: "",
      enabled: true,
  
      qcRuleItemType: QCRuleItemType.YESNO,
      expectedValue: "",
      qcRuleItemComparator: QCRuleItemComparator.EQUAL,
    };
  }

  previousStep() {
    this.stepIndex--;
  }
  nextStep() {
    if (this.passValidation()) {

      this.stepIndex++;
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      return this.qcRuleValidateStatus === 'success';
    }

    return true;
  }

  confirm() { 
      this.isSpinning = true;  
      
      this.qcRuleService.addQCRule(this.currentQCRule!).subscribe({
        next: () => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/qc/rules?name=${this.currentQCRule?.name}`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      }); 
  }
 
  disableQCRuleItem(qcRuleItem: QCRuleItem, disabled: boolean) {

    qcRuleItem.enabled = !disabled;
  }

  qcRuleNameChange() {  
    if (this.currentQCRule!.name) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.qcRuleService.getQCRules(this.currentQCRule!.name).subscribe({
        next: (qcRuleRes) => {
          if (qcRuleRes.length > 0) {
            // the order is already exists 
            this.qcRuleValidateStatus = 'nameExists'
          }
        }
      })
      this.qcRuleValidateStatus = 'success'
    }
    else {
      this.qcRuleValidateStatus = 'required'
    }
  }

  removeQCRuleItem(index: number) {

    console.log(`remove index: ${index}`);
    this.currentQCRule!.qcRuleItems.splice(index, 1);
    console.log(`after splice, we still have ${this.currentQCRule!.qcRuleItems.length} lines`);

    this.currentQCRule!.qcRuleItems = [...this.currentQCRule!.qcRuleItems];
 
  } 
}
