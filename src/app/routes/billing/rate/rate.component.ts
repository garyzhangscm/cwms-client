import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { Unit } from '../../common/models/unit';
import { UnitType } from '../../common/models/unit-type';
import { ClientService } from '../../common/services/client.service';
import { UnitService } from '../../common/services/unit.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillableCategory } from '../models/billable-category';
import { BillingCycle } from '../models/billing-cycle';
import { BillingRate } from '../models/billing-rate';
import { BillingRateService } from '../services/billing-rate.service';

@Component({
  selector: 'app-billing-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.less'],
})
export class BillingRateComponent implements OnInit {

  isSpinning = false;
  availableClients: Client[] = [];
  availableWarehouses: Warehouse[] = [];
  selectedClient?: Client;
  selectedWarehouse?: Warehouse;
  companySpecificFlag = true;

  billingRates: BillingRate[] = [];

  billableCategories = BillableCategory;
  billingCycles = BillingCycle;
 
  volumeUnits: Unit[] = [];

  displayOnly = false;
  constructor(
    private companyService: CompanyService,
    private warehouseService: WarehouseService,
    private billingRateService: BillingRateService,
    private messageService: NzMessageService,
    private unitService: UnitService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private clientService: ClientService) { 
      userService.isCurrentPageDisplayOnly("/billing/rate").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );           
    }

  ngOnInit(): void { 
    this.loadClients();
    this.loadWarehouses();

    // by default, we will load the company specific rate
    this.selectedClient = undefined;
    this.selectedWarehouse = undefined;
    this.companySpecificFlag = true;

    this.loadBillingRate();

    this.unitService.loadUnits().subscribe({
      next: (unitRes) => this.volumeUnits = unitRes.filter(unit => unit.type == UnitType.VOLUME)
    });
  }

  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): string => value.replace('$ ', '');
  
  loadBillingRate() {
    if (this.selectedClient == null && this.companySpecificFlag == false) {
      // the user has not select any thing yet, let's not display the billing rate section
      this.billingRates = [];
      return;
    }
    this.isSpinning = true;
    // let's initiate the billing rate with 0 rate for each category
    // then we will fill in the actual rate that we get from the server
    this.initiateBillingRate();

    this.billingRateService.getBillingRates(
      this.selectedWarehouse? this.selectedWarehouse.id : undefined, 
      this.selectedClient? this.selectedClient.id : undefined
    ).subscribe(
      {
        next: (billingRateRes) => {

          billingRateRes.forEach(
            billingRate => {
                        
              // find the matched rate that we already initiated
              this.billingRates.filter(
                initiatedBillingRate => initiatedBillingRate.billableCategory === billingRate.billableCategory
              ).forEach(
                initiatedBillingRate => {
                  initiatedBillingRate.billingCycle = billingRate.billingCycle;
                  initiatedBillingRate.rate = billingRate.rate;
                  initiatedBillingRate.enabled = billingRate.enabled; 
                }
              )
            }
          );
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    )

  }

  initiateBillingRate() {
    this.billingRates = [];
    for (let billableCategoryName in  BillableCategory) {
        if (isNaN(Number(billableCategoryName))) { 
          this.billingRates = [...this.billingRates, 

            this.getEmptyBillingRate(billableCategoryName)
          ]
      }
    } 
  }
  
  getEmptyBillingRate(billableCategoryName: string) : BillingRate {
    let billableCategory = (<any>BillableCategory)[billableCategoryName];
    return  { 
      companyId: this.companyService.getCurrentCompany()!.id,
      warehouseId: this.selectedWarehouse? this.selectedWarehouse.id : undefined,
      clientId: this.selectedClient? this.selectedClient.id : undefined,
      billableCategory: billableCategory,
      rate: 0,
      billingCycle: BillingCycle.DAILY,
      rateUnit: this.getBillingRateUnit(billableCategory),
      enabled: false,
    };
  }
  getBillingRateUnit(billableCategory: BillableCategory) : Unit | undefined{
    console.log(`start to get unit for billable category ${billableCategory}`) 

    if (billableCategory === BillableCategory.STORAGE_FEE_BY_LOCATION_COUNT) {
      console.log(`return location unit`)
      return {        
        type: UnitType.UNIT,
        name: "Location",
        description: "Location",        
        ratio: 1,
        baseUnitFlag: true,
      }
    }
    else if (billableCategory === BillableCategory.STORAGE_FEE_BY_PALLET_COUNT) {
      console.log(`return pallet unit`)
      return {        
        type: UnitType.UNIT,
        name: "Pallet",
        description: "Pallet",        
        ratio: 1,
        baseUnitFlag: true,
      }
    }
    else {
      return this.unitService.getBaseUnit(this.volumeUnits,  UnitType.VOLUME);

    }


  }

  loadClients() {
    this.clientService.loadClients().subscribe(
      {
        next: (clientRes) => this.availableClients = clientRes
      }
    )
  }
  loadWarehouses() {
    this.warehouseService.getWarehouses().subscribe(
      {
        next:(warehouseRes) => this.availableWarehouses = warehouseRes
      }
    )
  }
  selectedClientChanged() {
    // if the user select any client, uncheck the company specifc flag
    // so as to load the rate for specific client
    if (this.selectedClient != null) {
      this.companySpecificFlag = false;
    }
    else {
      this.companySpecificFlag = true;
    }
    // refresh the display
    this.loadBillingRate();
  }
  selectedWarehouseChanged() {
    
    // refresh the display
    this.loadBillingRate();
  }
  
  companySpecificFlagChanged() {
    // if the user check the company spefici flag, then clear the client selection and
    // reload the billing rate for the company
    if (this.companySpecificFlag == true) {
      this.selectedClient = undefined;
    } 
    // refresh the display
    this.loadBillingRate();
  }

  confirm() {
    this.isSpinning = true;
    this.billingRateService.saveBillingRates(this.billingRates).subscribe(
      {
        next:() => {
          
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    )
  }
}
