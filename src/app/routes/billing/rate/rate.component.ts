import { Component, Inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
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

  constructor(private http: _HttpClient, 
    private companyService: CompanyService,
    private warehouseService: WarehouseService,
    private billingRateService: BillingRateService,
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private clientService: ClientService) { }

  ngOnInit(): void { 
    this.loadClients();
    this.loadWarehouses();

    // by default, we will load the company specific rate
    this.selectedClient = undefined;
    this.selectedWarehouse = undefined;
    this.companySpecificFlag = true;

    this.loadBillingRate();
  }
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
          { 
            companyId: this.companyService.getCurrentCompany()!.id,
            warehouseId: this.selectedWarehouse? this.selectedWarehouse.id : undefined,
            clientId: this.selectedClient? this.selectedClient.id : undefined,
            billableCategory: (<any>BillableCategory)[billableCategoryName],
            rate: 0,
            billingCycle: BillingCycle.DAILY,
            enabled: false,
          }]
      }
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
