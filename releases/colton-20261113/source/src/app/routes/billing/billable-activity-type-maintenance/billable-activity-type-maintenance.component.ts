import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillableActivityType } from '../models/billable-activity-type';
import { BillableActivityTypeService } from '../services/billable-activity-type.service';

@Component({
    selector: 'app-billing-billable-activity-type-maintenance',
    templateUrl: './billable-activity-type-maintenance.component.html',
    standalone: false
})
export class BillingBillableActivityTypeMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  currentBillableActivityType: BillableActivityType; 
  
  stepIndex = 0; 
  nameValidateStatus = 'warning'; 
  nameErrorCode = ''; 
  isSpinning = false; 
   
  pageTitle = ""; 

  constructor(private http: _HttpClient, 
    private billableActivityTypeService: BillableActivityTypeService, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private messageService: NzMessageService, 
    private warehouseService: WarehouseService,
    private router: Router,) { 
 

      this.currentBillableActivityType = {        
        name: "",
        description: "",
        warehouseId: this.warehouseService.getCurrentWarehouse().id        
      }
    }

  ngOnInit(): void {   
    this.pageTitle = this.i18n.fanyi('billable-activity-type');
  }
   
  nameChange(event: Event) {  
    this.currentBillableActivityType!.name = (event.target as HTMLInputElement).value;
    if (this.currentBillableActivityType!.name) {
      // THE USER input the version number, let's make sure it is not exists yet
      this.billableActivityTypeService.getBillableActivityTypes(this.currentBillableActivityType!.name).subscribe({
        next: (billableActivityTypeRes) => {
          if (billableActivityTypeRes.length > 0) {
            // the activity type is already exists 
            this.nameValidateStatus = 'error'; 
            this.nameErrorCode = 'numberExists'
          }
        }
      })
      this.nameValidateStatus = 'success'
    }
    else {
      this.nameValidateStatus = 'required'
    }
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
      return this.nameValidateStatus === 'success';
    }

    return true;
  } 
  
  confirm() { 
      this.isSpinning = true;   

      this.billableActivityTypeService.addBillableActivityType(this.currentBillableActivityType).subscribe({
        next: () => {
  
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/billing/billable-activity-type`);
          }, 500);
        },
        error: () => {
          this.isSpinning = false;
        },
      });  
    
  }  

}
