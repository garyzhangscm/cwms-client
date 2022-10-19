import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { AlertTemplate } from '../../alert/models/alert-template';
import { Client } from '../../common/models/client';
import { CustomerService } from '../../common/services/customer.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ListPickConfiguration } from '../models/list-pick-configuration';
import { ListPickConfigurationGroupRule } from '../models/list-pick-configuration-group-rule';
import { ListPickGroupRuleType } from '../models/list-pick-group-rule-type.enum';
import { PickType } from '../models/pick-type.enum';
import { ListPickConfigurationService } from '../services/list-pick-configuration.service';

@Component({
  selector: 'app-outbound-list-pick-configuration-maintenance',
  templateUrl: './list-pick-configuration-maintenance.component.html',
})
export class OutboundListPickConfigurationMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentListPickConfiguration!: ListPickConfiguration;   
  isSpinning = false;
  newListPickConfiguration = true;
  
  pickTypes = PickType;  

  clients: Client[] = [];
  listPickGroupRuleTypes = ListPickGroupRuleType;
  selectedGroupRuleTypes = new Map();


  constructor( 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService,  
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private listPickConfigurationService: ListPickConfigurationService,
    private messageService: NzMessageService,
    private warehouseService: WarehouseService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('modify'));
    this.pageTitle = this.i18n.fanyi('modify');
     
    this.activatedRoute.queryParams.subscribe(params => {
          if (params.id) {
            this.listPickConfigurationService.get(params.id).subscribe(
              {
    
                next: (listPickConfigurationRes) => {
                  this.currentListPickConfiguration = listPickConfigurationRes;
                  this.newListPickConfiguration = false;
                }
    
              }); 
          } else {
            this.newListPickConfiguration = true
            this.currentListPickConfiguration = this.getEmptyListPickConfiguration();
             
            this.titleService.setTitle(this.i18n.fanyi('new'));
            this.pageTitle = this.i18n.fanyi('new'); 
          }
        }); 

 
  }
   
   
  getEmptyListPickConfiguration(): ListPickConfiguration {
    return { 
        sequence:0, 
        warehouseId: this.warehouseService.getCurrentWarehouse().id, 
        enabled: true,
        groupRules: []
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void { 
    this.isSpinning = true;
    if (this.newListPickConfiguration) {

      this.listPickConfigurationService.add(this.currentListPickConfiguration).subscribe({
        next: (listPickConfigurationRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            let url = `/outbound/list-pick-configuration?pickType=${listPickConfigurationRes.pickType}`;
            if (listPickConfigurationRes.customer?.name) {
              url = `${url}&customer=${listPickConfigurationRes.customer?.name}`;
            }
            if (listPickConfigurationRes.client?.name) {
              url = `${url}&client=${listPickConfigurationRes.client?.name}`;
            }
            this.router.navigateByUrl(url);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
    else {

      this.listPickConfigurationService.change(this.currentListPickConfiguration).subscribe({
        next: (listPickConfigurationRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            let url = `/outbound/list-pick-configuration?pickType=${listPickConfigurationRes.pickType}`;
            if (listPickConfigurationRes.customer?.name) {
              url = `${url}&customer=${listPickConfigurationRes.customer?.name}`;
            }
            if (listPickConfigurationRes.client?.name) {
              url = `${url}&client=${listPickConfigurationRes.client?.name}`;
            }
            this.router.navigateByUrl(url);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }


  customerChanged(event: Event) { 
    let customerName: string = (event.target as HTMLInputElement).value; 
    console.log(`customer name is changed to ${customerName}`);
    if (customerName != "") {
      this.customerService.getCustomers(customerName).subscribe({
        next: (customerRes) => {
            if(customerRes.length > 0) {
              this.currentListPickConfiguration.customerId = customerRes[0].id;
              this.currentListPickConfiguration.customer = customerRes[0];

            }
        }
      })

    }
  }
 
  selectedGroupRuleTypeChanged(selectedGroupRuleTypes: string[]): void {
    console.log(selectedGroupRuleTypes);
    this.currentListPickConfiguration.groupRules = selectedGroupRuleTypes.map(
      selectedGroupRuleType => {
          const groupRuleTypeEnum = selectedGroupRuleType as ListPickGroupRuleType;
          return {
            
            groupRuleType: groupRuleTypeEnum
          };
      }
    )
    
  }
  isListPickGroupRuleTypeSelected(value: string) : boolean{ 
    return this.currentListPickConfiguration.groupRules.some(
      groupRule =>  groupRule.groupRuleType.toString().localeCompare(value) === 0 
    );;

  }
}
