import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { Unit } from '../../common/models/unit';
import { UnitType } from '../../common/models/unit-type';
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { UnitService } from '../../common/services/unit.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ListPickConfiguration } from '../models/list-pick-configuration'; 
import { ListPickGroupRuleType } from '../models/list-pick-group-rule-type.enum';
import { PickType } from '../models/pick-type.enum';
import { ListPickConfigurationService } from '../services/list-pick-configuration.service';

@Component({
    selector: 'app-outbound-list-pick-configuration-maintenance',
    templateUrl: './list-pick-configuration-maintenance.component.html',
    standalone: false
})
export class OutboundListPickConfigurationMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentListPickConfiguration!: ListPickConfiguration;   
  isSpinning = false;
  newListPickConfiguration = true;
  
  pickTypes = PickType;  
  pickTypesKeys = Object.keys(this.pickTypes);

  clients: Client[] = [];
  listPickGroupRuleTypes = ListPickGroupRuleType;
  listPickGroupRuleTypesKeys = Object.keys(this.listPickGroupRuleTypes);
  selectedGroupRuleTypes = new Map();

  volumeUnits: Unit[] = [];
  weightUnits: Unit[] = [];
  defaultVolumeUnit?: Unit;
  defaultWeightUnit?: Unit;
  validCustomers: Customer[] = [];

  threePartyLogisticsFlag = false;

  constructor( 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService,  
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private listPickConfigurationService: ListPickConfigurationService,
    private messageService: NzMessageService,
    private warehouseService: WarehouseService,
    private customerService: CustomerService,
    private clientService: ClientService,
    private router: Router,
    private unitService: UnitService,
    private localCacheService: LocalCacheService,
  ) {}

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('modify'));
    this.pageTitle = this.i18n.fanyi('modify');
     
    this.loadValidCustomers();
    this.loadUnits();
    this.loadClients();

    this.activatedRoute.queryParams.subscribe(params => {
          if (params['id']) {
            this.listPickConfigurationService.get(params['id']).subscribe(
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

  loadClients() { 
    
    this.isSpinning = true;
    
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {
 
        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        }
        if (this.threePartyLogisticsFlag) {
          this.clientService.getClients().subscribe({
            next: (clientRes) => this.clients = clientRes
            
          });
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  } 
  
  loadUnits() {
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {
        unitsRes.forEach(
          unit => {
            if (unit.type === UnitType.VOLUME) {
              this.volumeUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultVolumeUnit = unit;
                console.log(`defaultVolumeUnit: ${this.defaultVolumeUnit?.name}`);
              }
            }
            else if (unit.type === UnitType.WEIGHT) {
              this.weightUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultWeightUnit = unit;
                console.log(`defaultWeightUnit: ${this.defaultWeightUnit?.name}`);
              }
            }
          }
        )
      }
    })    
  }
   
  getEmptyCustomer(): Customer{
    return {       
      name: "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      companyId: this.companyService.getCurrentCompany()!.id,
      description:  "",
      contactorFirstname:  "",
      contactorLastname:  "",
      addressCountry:  "",
      addressState:  "", 
      addressCity:  "", 
      addressLine1:  "", 
      addressPostcode:  "",
    }
  }
   
  getEmptyListPickConfiguration(): ListPickConfiguration {
    return { 
        sequence:0, 
        warehouseId: this.warehouseService.getCurrentWarehouse().id, 
        customer:  this.getEmptyCustomer(),
        enabled: true,
        allowLPNPick: false,
        groupRules: [],
        maxVolume: 0,
        maxWeight: 0,
        maxPickCount: 0,
        maxQuantity: 0,
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


  customerChanged() { 
    
    console.log(`customer is chagned to ${this.currentListPickConfiguration!.customer!.name}`)
    const matchedCustomer = this.validCustomers.find(customer => customer.name === this.currentListPickConfiguration!.customer!.name)
    if (matchedCustomer) {
      // clone a new customer structure so any further change won't 
      // mess up with the existing customers auto complete drop down list
      var clone = { ...matchedCustomer };
      this.currentListPickConfiguration!.customer = clone;
      this.currentListPickConfiguration!.customerId= clone.id!;
    }
    else {
      
      this.currentListPickConfiguration!.customer = this.getEmptyCustomer();
      this.currentListPickConfiguration!.customerId = undefined;
    }
    
  }
 
  weightUnitSelected(unit: Unit) { 
    this.currentListPickConfiguration.maxWeightUnit = unit.name;
  } 
  volumeUnitSelected(unit: Unit) { 
    this.currentListPickConfiguration.maxVolumeUnit = unit.name;
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
    ); 

  }
   
  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    });
  }
}
