import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange } from 'ng-zorro-antd/transfer';

import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionRequestItem } from '../models/qc-inspection-request-item';
import { QCInspectionResult } from '../models/qc-inspection-result';
import { QCRule } from '../models/qc-rule';
import { QCRuleConfiguration } from '../models/qc-rule-configuration';
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
  selector: 'app-qc-inspect-inventory',
  templateUrl: './inspect-inventory.component.html',
})
export class QcInspectInventoryComponent implements OnInit {
   
  stepIndex = 0;
  pageTitle: string = ""; 
  isSpinning = false; 
  qcInspectionRequests: QcInspectionRequest[] = [];
  inventoryQCRequestMap = new Map();
  inventoryQCResultMap = new Map();
  qcRuleItemTypes = QCRuleItemType;
  qcInspectionResults = QCInspectionResult;


  constructor(private http: _HttpClient, 
    private inventoryService: InventoryService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('qc-inspection');
 
  }
  
  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.ids) { 
        this.qcInspectionRequestService.getPendingQCInspectionRequest(undefined, params.ids)
        .subscribe({
          next: (qcInspectionRequestRes) => {
            this.qcInspectionRequests = qcInspectionRequestRes;
            
            qcInspectionRequestRes.forEach(
              qcRequest => {
                const lpn = qcRequest.inventory.lpn!;
                let qcRules: QCInspectionRequestItem[] = [];
                if (this.inventoryQCRequestMap.has(lpn)) {
                  qcRules = this.inventoryQCRequestMap.get(lpn);
                }
                
                qcRules = [...qcRules, ...qcRequest.qcInspectionRequestItems];
                

                this.inventoryQCRequestMap.set(lpn, qcRules);
              }
            );
            this.refreshInventoryQCResultMap();

            
          }
        })
      } 
    }); 
}
refreshInventoryQCResultMap() {
  //inventoryQCRequestMap
  // key: lpn
  // value: QCInspectionRequestItem list
  this.inventoryQCRequestMap.forEach((qcInspectionRequestItems: QCInspectionRequestItem[], lpn: string) => { 
    
      let lpnQCInspectionResult = QCInspectionResult.PASS;
        // if everything is pending, then the overall result is pending so we can inspect again later on
        // otherwise, if we have one fail, the overall result is fail
      if (!qcInspectionRequestItems.some(
            qcInspectionRequestItem =>  qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PENDING
            )) {
            lpnQCInspectionResult = QCInspectionResult.PENDING;
      }
      else if (qcInspectionRequestItems.some(
                qcInspectionRequestItem => qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PASS
                )) {
          // at least one option fail, let's make the whole request as fail
          lpnQCInspectionResult = QCInspectionResult.FAIL
      }
      else {
          
        lpnQCInspectionResult = QCInspectionResult.PASS
      }
      this.inventoryQCResultMap.set(lpn, lpnQCInspectionResult);


  });
}


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    // let get the overall request for each request
    this.qcInspectionRequests.forEach(
      qcInspectionRequest => {
        // if everything is pending, then the overall result is pending so we can inspect again later on
        // otherwise, if we have one fail, the overall result is fail
        if (!qcInspectionRequest.qcInspectionRequestItems.some(
            qcInspectionRequestItem =>  qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PENDING
            )) {
          qcInspectionRequest.qcInspectionResult = QCInspectionResult.PENDING;
        }
        else if (qcInspectionRequest.qcInspectionRequestItems.some(
          qcInspectionRequestItem => qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PASS
          )) {
            // at least one option fail, let's make the whole request as fail
            qcInspectionRequest.qcInspectionResult = QCInspectionResult.FAIL
        }
        else {
            
          qcInspectionRequest.qcInspectionResult = QCInspectionResult.PASS
        }

        console.log(`========   ${qcInspectionRequest.id}  ======`);
        console.log(`result: ${qcInspectionRequest.qcInspectionResult}`);
        qcInspectionRequest.qcInspectionRequestItems.forEach(
          qcInspectionRequestItem => {

            console.log(`> ${qcInspectionRequestItem.qcRule.name} / result: ${qcInspectionRequestItem.qcInspectionResult}`)
            qcInspectionRequestItem.qcInspectionRequestItemOptions.forEach(
              qcInspectionRequestItemOption => {
                console.log(`>>>> ${qcInspectionRequestItemOption.qcRuleItem.checkPoint} / result: ${qcInspectionRequestItemOption.qcInspectionResult}`)

              }
            )
          }
        );
      }
    )
    this.qcInspectionRequestService.savePendingQCInspectionRequest(this.qcInspectionRequests).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.router.navigateByUrl(`/qc/inspection`);
        }, 2500);
      },
      error: () => this.isSpinning = false
    }) 

     
  }
  qcInspectionRequestItemOptionChanged(qcInspectionRequestItem: QCInspectionRequestItem){

    if (!qcInspectionRequestItem.qcInspectionRequestItemOptions.some(
          qcInspectionRequestItemOption => qcInspectionRequestItemOption.qcInspectionResult !== QCInspectionResult.PENDING
        )) {
          // all options are pending, let's set the result to pending
          qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.PENDING
    }
    else if (qcInspectionRequestItem.qcInspectionRequestItemOptions.some(
        qcInspectionRequestItemOption => qcInspectionRequestItemOption.qcInspectionResult !== QCInspectionResult.PASS
      )) {
        // at least one option fail, let's make the whole request as fail
        qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.FAIL
    }
    else {
        
        qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.PASS
    }
    this.refreshInventoryQCResultMap();
  }
   
}
