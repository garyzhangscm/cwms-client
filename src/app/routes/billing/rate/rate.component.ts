import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

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
import { BillingRateByInventoryAge } from '../models/billing-rate-by-inventory-age';
import { BillingRateByInventoryAgeService } from '../services/billing-rate-by-inventory-age.service';
import { BillingRateService } from '../services/billing-rate.service';

@Component({
    selector: 'app-billing-rate',
    templateUrl: './rate.component.html',
    styleUrls: ['./rate.component.less'],
    standalone: false
})
export class BillingRateComponent implements OnInit {

  isSpinning = false;
  availableClients: Client[] = [];
  availableWarehouses: Warehouse[] = [];
  selectedClient?: Client;
  selectedWarehouse?: Warehouse;
  companySpecificFlag = true;

  billingRates: BillingRate[] = [];
  billingRateByInventoryAges: BillingRateByInventoryAge[] = [];

  selectedBillingRateGroup = 0;

  billableCategories = BillableCategory;
  billingCycles = BillingCycle;
  billingCyclesKeys = Object.keys(this.billingCycles);
  
  newBillingRateByInventoryAgeForm!: UntypedFormGroup;
  newBillingRateByInventoryAgeModal!: NzModalRef;
 
  volumeUnits: Unit[] = [];

  displayOnly = false;
  constructor(
    private companyService: CompanyService,
    private fb: UntypedFormBuilder,
    private modalService: NzModalService,
    private warehouseService: WarehouseService,
    private billingRateService: BillingRateService,
    private billingRateByInventoryAgeService: BillingRateByInventoryAgeService,
    private messageService: NzMessageService,
    private unitService: UnitService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private clientService: ClientService) { 
      userService.isCurrentPageDisplayOnly("/billing/rate").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );           
      
      this.unitService.loadUnits().subscribe({
        next: (unitRes) => this.volumeUnits = unitRes.filter(unit => unit.type == UnitType.VOLUME)
      });
    }

  ngOnInit(): void { 
    this.loadClients();
    this.loadWarehouses();

    // by default, we will load the company specific rate
    this.selectedClient = undefined;
    this.selectedWarehouse = undefined;
    this.companySpecificFlag = true;

    this.loadBillingRateByInventoryAge();

  }

  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): number => parseFloat(value?.replace(/\$\s?|(,*)/g, ''));
  
  // parserDollar = (value: string): string => value.replace('$ ', '');
  
  loadBillingRateByInventoryAge() {
    if (this.selectedClient == null && this.companySpecificFlag == false) {
      // the user has not select any thing yet, let's not display the billing rate section
      this.billingRateByInventoryAges = [];
      return;
    }
    this.isSpinning = true;
    // let's initiate the billing rate with 0 rate for each category
    // then we will fill in the actual rate that we get from the server
    // this.initiateBillingRate();

    this.billingRateByInventoryAgeService.getBillingRateByInventoryAges(
      this.selectedWarehouse? this.selectedWarehouse.id : undefined, 
      this.selectedClient? this.selectedClient.id : undefined
    ).subscribe(
      {
        next: (billingRateByInventoryAgeRes) => {

          this.billingRateByInventoryAges = this.sortBillingRateByInventoryAges(billingRateByInventoryAgeRes)
          // setup the rate unit based on the name
          this.billingRateByInventoryAges.forEach(
            billingRateByInventoryAge => {
              billingRateByInventoryAge.billingRates.forEach(
                billingRate => {
                  if (billingRate.rateUnitName) {
                    billingRate.rateUnit = this.volumeUnits.find(unit => unit.name == billingRate.rateUnitName)

                  }
                  else {
                    billingRate.rateUnit = undefined;
                  }
                }
              )
            }
          )
          
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
    const rateUnit = this.getBillingRateUnit(billableCategory)  ;
    return  { 
      companyId: this.companyService.getCurrentCompany()!.id,
      warehouseId: this.selectedWarehouse? this.selectedWarehouse.id : undefined,
      clientId: this.selectedClient? this.selectedClient.id : undefined,
      billableCategory: billableCategory,
      rate: 0,
      billingCycle: BillingCycle.DAILY,
      rateUnit: rateUnit,
      rateUnitName: rateUnit?.name,
      rateByQuantity: this.isRateByQuantity(billableCategory),
      enabled: false,
      
    };
  }

  isRateByQuantity(billableCategory: BillableCategory) : boolean {
    return billableCategory === BillableCategory.STORAGE_FEE_BY_CASE_COUNT ||
           billableCategory === BillableCategory.STORAGE_FEE_BY_LOCATION_COUNT ||
           billableCategory === BillableCategory.STORAGE_FEE_BY_PALLET_COUNT
  }
  getBillingRateUnit(billableCategory: BillableCategory) : Unit | undefined{
    console.log(`start to get unit for billable category ${billableCategory}`) 
/**
 * 
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
 * 
 */
    if (billableCategory === BillableCategory.STORAGE_FEE_BY_GROSS_VOLUME || 
        billableCategory === BillableCategory.STORAGE_FEE_BY_NET_VOLUME) {
          return this.unitService.getBaseUnit(this.volumeUnits,  UnitType.VOLUME);
    }
    return undefined;


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
    this.loadBillingRateByInventoryAge();
  }
  selectedWarehouseChanged() {
    
    // refresh the display
    this.loadBillingRateByInventoryAge();
  }
  
  companySpecificFlagChanged() {
    // if the user check the company spefici flag, then clear the client selection and
    // reload the billing rate for the company
    if (this.companySpecificFlag == true) {
      this.selectedClient = undefined;
    } 
    // refresh the display
    this.loadBillingRateByInventoryAge();
  }

  confirm() {
    this.isSpinning = true;
    this.billingRateByInventoryAgeService.saveBillingRateByInventoryAges(this.billingRateByInventoryAges).subscribe(
      {
        next:() => {
          
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          this.isSpinning = false;
        }, 
        error: () => this.isSpinning = false
      }
    )
  }

  
  openNewBillingRateByInventoryAgeModal( 
    tplNewBillingRateByInventoryAgeModalTitle: TemplateRef<{}>,
    tplNewBillingRateByInventoryAgeModalContent: TemplateRef<{}>, 
  ): void { 
    this.newBillingRateByInventoryAgeForm = this.fb.group({
       
      startInventoryAge: [null],
      endInventoryAge: [null],
    });
 
    // Load the location
    this.newBillingRateByInventoryAgeModal = this.modalService.create({
      nzTitle: tplNewBillingRateByInventoryAgeModalTitle,
      nzContent: tplNewBillingRateByInventoryAgeModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.newBillingRateByInventoryAgeModal.destroy(); 
      },
      nzOnOk: () => {
        console.log(`this.newBillingRateByInventoryAgeForm.controls.startInventoryAge.value: ${this.newBillingRateByInventoryAgeForm.value.startInventoryAge.value}`)
        console.log(`this.newBillingRateByInventoryAgeForm.controls.startInventoryAge.value == null?: ${!this.newBillingRateByInventoryAgeForm.value.startInventoryAge.value}`)
        if (!this.newBillingRateByInventoryAgeForm.value.startInventoryAge.value ||
              !this.newBillingRateByInventoryAgeForm.value.endInventoryAge.value) {
           
              this.messageService.error(`start inventory age and end inventory age are required`);
              return false;
        }
        if (this.newBillingRateByInventoryAgeForm.value.startInventoryAge.value  >
             this.newBillingRateByInventoryAgeForm.value.endInventoryAge.value ) {
           
              this.messageService.error(`start inventory age needs to be less than end inventory age`);
              return false;
        }
        
        this.newBillingRateByInventoryAgeModal.updateConfig({ 
          nzOkDisabled: true,
          nzOkLoading: true
        });
        this.addNewBillingRateGroup( 
          this.newBillingRateByInventoryAgeForm.value.startInventoryAge.value,
          this.newBillingRateByInventoryAgeForm.value.endInventoryAge.value,
        );
        return false;
      },

      nzWidth: 1000,
    });
  }

  addNewBillingRateGroup(startInventoryAge: number, endInventoryAge: number) {

    let billingRates : BillingRate[] = [];
    for (let billableCategoryName in  BillableCategory) {
        if (isNaN(Number(billableCategoryName))) { 
          billingRates = [...billingRates, 

            this.getEmptyBillingRate(billableCategoryName)
          ]
      }
    }
    this.billingRateByInventoryAges = this.sortBillingRateByInventoryAges(
        [...this.billingRateByInventoryAges, 
          {
        
            companyId: this.companyService.getCurrentCompany()!.id,
            warehouseId: this.selectedWarehouse? this.selectedWarehouse.id : undefined,
            clientId: this.selectedClient? this.selectedClient.id : undefined,
            startInventoryAge: startInventoryAge,
            endInventoryAge: endInventoryAge,
            
            billingRates: billingRates, 
            enabled: true,
          }
        ]
    );
    
    this.newBillingRateByInventoryAgeModal.destroy(); 
  }
  sortBillingRateByInventoryAges(billingRateByInventoryAges: BillingRateByInventoryAge[]) {
    return billingRateByInventoryAges.sort((group1, group2) => group1.startInventoryAge - group2.startInventoryAge)
  }
  
  removeBillingRateGroup({ index }: { index: number }) {
    console.log(`remove billing rate group with index of ${index}`);
    const id = this.billingRateByInventoryAges[index].id;
    if (id) {
      this.isSpinning = true;
      this.billingRateByInventoryAgeService.removeBillingRateByInventoryAge(id).subscribe({
        next: () => {
          this.isSpinning = false;
          this.billingRateByInventoryAges.splice(index, 1);
        }, 
        error: () => this.isSpinning = false
      })
    }
    else {
      // this is a newly added group and not saved in the server yet
          this.billingRateByInventoryAges.splice(index, 1);

    }
  }

  billingRateUnitChanged(billingRate: BillingRate, rateUnit: Unit) {
    billingRate.rateUnit = rateUnit;
    billingRate.rateUnitName = rateUnit.name;
  }
}
