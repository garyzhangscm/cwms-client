import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ItemService } from '../../inventory/services/item.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QcInspectionRequestType } from '../models/qc-inspection-request-type';
import { QCInspectionResult } from '../models/qc-inspection-result';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
  selector: 'app-qc-qc-inspection-request-maintenance',
  templateUrl: './qc-inspection-request-maintenance.component.html',
})
export class QcQcInspectionRequestMaintenanceComponent implements OnInit {
  currentQCInspectionRequest!: QcInspectionRequest;
  stepIndex = 0;
  pageTitle: string;
  newQCInspectionRequest = true;
  filterBy = "None";
  qcInspectionRequestNumberValidateStatus = 'warning'; 


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private messageService: NzMessageService,
    private router: Router,
    private itemService: ItemService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.qc.qc-inspection-request-maintenance');

    this.currentQCInspectionRequest = this.createEmptyQCInspectionRequest();
  }

  createEmptyQCInspectionRequest(): QcInspectionRequest {
    return {

      number:  "",
      qcInspectionRequestItems: [],
      qcInspectionResult: QCInspectionResult.PENDING,
    
  
       type: QcInspectionRequestType.BY_ITEM // now we will only support generate QC by item

    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.qcInspectionRequestService.getQCInspectionRequest(params.id)
          .subscribe(qcInspectionRequestRes => {
            this.currentQCInspectionRequest = qcInspectionRequestRes;

            this.newQCInspectionRequest = false;
          });
      }
      else { 
        this.newQCInspectionRequest = true;
      }
    });

  }

  
  qcInspectionRequestChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentQCInspectionRequest!.number = (event.target as HTMLInputElement).value; 
    if (this.currentQCInspectionRequest!.number) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.qcInspectionRequestService.getQCInspectionRequests(
        undefined, undefined, undefined,  this.currentQCInspectionRequest!.number

      ).subscribe({
        next: (qcInspectionRequestRes) => {
          if (qcInspectionRequestRes.length > 0) {
            // the order is already exists 
            this.qcInspectionRequestNumberValidateStatus = 'numberExists'
          }
        }
      })
      this.qcInspectionRequestNumberValidateStatus = 'success'
    }
    else {
      this.qcInspectionRequestNumberValidateStatus = 'required'
    }
  }

  returnToPreviousPage() {
    
    if (this.newQCInspectionRequest) {

      this.router.navigateByUrl(`/qc/inspection`);
    }
    else {

      this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}`);
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
      return this.qcInspectionRequestNumberValidateStatus === 'success';
    }

    return true;
  }
  confirm(): void {
    if (this.newQCInspectionRequest) {

      this.qcInspectionRequestService.addQCInspectionRequest(this.currentQCInspectionRequest)
        .subscribe(
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}`);
              }, 2500);
            }
          });
    }
    else {

      this.qcInspectionRequestService.changeQCInspectionRequest(this.currentQCInspectionRequest)
        .subscribe(
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}`);
              }, 2500);
            }
          });
    }
  }
  
  
  itemNameChanged(event: Event) {
    const itemName = (event.target as HTMLInputElement).value.trim();
    if (itemName.length > 0) {

      this.itemService.getItems(itemName).subscribe(
        {
          next: (itemsRes) => {
            if (itemsRes.length === 1) {
              console.log(`item is changed to ${itemsRes[0].name}`);
              this.currentQCInspectionRequest.item = itemsRes[0]; 
            }
          }
        }
      )
    }
  }
  

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with item name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) {
            this.currentQCInspectionRequest.item = itemsRes[0]; 
          }
        }
      }
    )
    
  }

}
