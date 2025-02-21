import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { LocalCacheService } from '../../util/services/local-cache.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
    selector: 'app-common-client-maintenance',
    templateUrl: './client-maintenance.component.html',
    standalone: false
})
export class CommonClientMaintenanceComponent implements OnInit {
  currentClient!: Client;
  pageTitle = '';
  isSpinning = false;

  warehouseSpecific: boolean = false;
  stepIndex = 0;
  newClient = true;
  clientNameValidateStatus = 'warning'; 

  constructor(private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, private warehouseService: WarehouseService, 
    private clientService: ClientService,
    private companyService: CompanyService,
    private activatedRoute: ActivatedRoute, 
    private messageService: NzMessageService,
    private localCacheService: LocalCacheService) {

      this.currentClient = { 
        name: '',
        description: '',
        contactorFirstname: '',
        contactorLastname: '',
        addressCountry: '',
        addressState: '',
        addressCounty: '',
        addressCity: '',
        addressDistrict: '',
        addressLine1: '',
        addressLine2: '',
        addressPostcode: '',
        companyId: this.companyService.getCurrentCompany()!.id,
        listPickEnabledFlag: false,
      };
  }

  ngOnInit(): void {
    
    this.titleService.setTitle(this.i18n.fanyi('page.client-maintenance.add.title'));
    this.pageTitle = this.i18n.fanyi('page.client-maintenance.add.title');

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        // Get the production line by ID
        this.localCacheService.getClient(params['id'])
          .subscribe({
            next: (clientRes) => {

              this.currentClient = clientRes;
              this.newClient = false;
              this.clientNameValidateStatus = 'success';
              if (clientRes.warehouseId) {
  
                this.warehouseSpecific = true;
              }
              else { 
                this.warehouseSpecific = true;
              }
            }
          });
      }
    });
  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    if (this.passValidation()) {

      this.stepIndex++;
    }

  }
 
  clientNameChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentClient!.name = (event.target as HTMLInputElement).value; 
    if (this.currentClient!.name) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.clientService.getClients(this.currentClient!.name).subscribe({
        next: (clientRes) => {
          if (clientRes.length > 0) {
            // the order is already exists 
            this.clientNameValidateStatus = 'numberExists'
          }
        }
      })
      this.clientNameValidateStatus = 'success'
    }
    else {
      this.clientNameValidateStatus = 'required'
    }
  }
  passValidation() : boolean {

    if (this.stepIndex === 0) {
      return this.clientNameValidateStatus === 'success';
    }

    return true;
  }
 
  
  warehouseSpeficFlagChanged()   {
    this.currentClient!.warehouseId = this.warehouseSpecific ? this.warehouseService.getCurrentWarehouse().id : undefined; 
  }
  confirm(){
    this.isSpinning = true;
    if (this.newClient) {

      this.clientService.addClient(this.currentClient!).subscribe({
        next:() =>
        {
          
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/common/client?name=${this.currentClient.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
    }
    else {
      
      this.clientService.changeClient(this.currentClient!).subscribe({
        next:() =>
        {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/common/client?name=${this.currentClient.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
    }
  }
}
