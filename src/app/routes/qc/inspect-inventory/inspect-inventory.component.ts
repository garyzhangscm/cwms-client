import { Component, inject, OnInit, } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core'; 
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message'; 
 
import { ItemSampling } from '../../inventory/models/item-sampling'; 
import { ItemSamplingService } from '../../inventory/services/item-sampling.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionRequestItem } from '../models/qc-inspection-request-item';
import { QCInspectionRequestItemOption } from '../models/qc-inspection-request-item-option';
import { QCInspectionResult } from '../models/qc-inspection-result'; 
import { QCRuleItemComparator } from '../models/qc-rule-item-comparator';
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
    selector: 'app-qc-inspect-inventory',
    templateUrl: './inspect-inventory.component.html',
    styleUrls: ['./inspect-inventory.component.less'],
    standalone: false
})
export class QcInspectInventoryComponent implements OnInit {
   
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  stepIndex = 0;
  pageTitle: string = ""; 
  isSpinning = false; 
  qcInspectionRequests: QcInspectionRequest[] = [];
  inventoryQCRequestMap = new Map();
  inventoryQCResultMap = new Map();
  qcRuleItemTypes = QCRuleItemType;
  qcInspectionResults = QCInspectionResult;
  itemSamplingMap = new Map();
  notApplyQCInspectionRequestItemOptionSet = new Set();
  isCollapse = false;


  constructor( 
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService,
    private itemSamplingService: ItemSamplingService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('qc-inspection');
 
  }
  
  ngOnInit(): void {


    this.itemSamplingMap = new Map();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['ids']) { 
        this.qcInspectionRequestService.getPendingQCInspectionRequest(undefined, params['ids'])
        .subscribe({
          next: (qcInspectionRequestRes) => {
            this.qcInspectionRequests = qcInspectionRequestRes;
            
            qcInspectionRequestRes.forEach(
              qcRequest => {
                const lpn = qcRequest.inventory!.lpn!;
                let qcRules: QCInspectionRequestItem[] = [];
                if (this.inventoryQCRequestMap.has(lpn)) {
                  qcRules = this.inventoryQCRequestMap.get(lpn);
                }
                
                qcRules = [...qcRules, ...qcRequest.qcInspectionRequestItems];
                

                this.inventoryQCRequestMap.set(lpn, qcRules);
                this.loadItemSampling(lpn, qcRequest.inventory!.item?.id, qcRequest.inventory!.item?.name);
              }
            );
            this.refreshInventoryQCResultMap();

            
          }
        })
      } 
    }); 
}
loadItemSampling(lpn: string, itemId?: number, itemName?: string) {
  // we will only load the item sampling information if we haven't done so
  // we will always assume there's only one item on this lpn
  if (!this.itemSamplingMap.has(lpn)) {
    this.itemSamplingService.getItemSamplings(undefined, itemName, itemId, undefined, true).subscribe(
      {
        next: (itemSamplingRes) => {
          // we should only get at most one enabled item sampling for each item
          if (itemSamplingRes.length === 1) {
            this.itemSamplingMap.set(lpn, itemSamplingRes[0])
          }
        }
      }
    )

  }
}

toggleCollapse(): void {
  this.isCollapse = !this.isCollapse;
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

        // console.log(`========   ${qcInspectionRequest.id}  ======`);
        // console.log(`result: ${qcInspectionRequest.qcInspectionResult}`);
        /**
         * 
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
         */
        
      }
    )
    this.qcInspectionRequestService.saveQCInspectionRequest(this.qcInspectionRequests).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/qc/inspection`);
        }, 500);
      },
      error: () => this.isSpinning = false
    }) 

     
  }

  // For YesNo type question, we will only compare the result to either true or fail
  resetQCInspectionRequestItemYESNOOptionResult(qcInspectionRequestItemOption: QCInspectionRequestItemOption) {

    // for yes no question, we will only allow the comparator to 'equals'.
    // console.log(`qcInspectionRequestItemOption.value for YESNO: ${qcInspectionRequestItemOption.value}`);
    if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator != QCRuleItemComparator.EQUAL) {

      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PENDING;
      return;
    }
    // if the use has not chosen anything, or chose N/A, then the result of this option is PENDING
    if (qcInspectionRequestItemOption.value == 'NOT_APPLY') {
      // if the question is not apply, then we consider it is a pass
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.NOT_APPLY;
      return;
    }
    else if (!qcInspectionRequestItemOption.value || qcInspectionRequestItemOption.value == 'PENDING') {
      
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PENDING;
      return;
    }
    
    // convert the result into boolean value
    qcInspectionRequestItemOption.booleanValue = qcInspectionRequestItemOption.value.trim().toLowerCase() == "yes";
    
    // compare the user's input to the expectation
    if (qcInspectionRequestItemOption.qcRuleItem.expectedValue.toLowerCase() == 'true' &&
      qcInspectionRequestItemOption.booleanValue === true
      ) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else if (qcInspectionRequestItemOption.qcRuleItem.expectedValue.toLowerCase() == 'false' &&
      qcInspectionRequestItemOption.booleanValue === false
      ) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.FAIL;
    }    
  }
  
  // for number type question, we will allow to compare the result to the expectation by 
  // equals / greater than / les stahn / great or equal / less or equals
  resetQCInspectionRequestItemNUMBEROptionResult(qcInspectionRequestItemOption: QCInspectionRequestItemOption) {

    // make sure the user input something
    if (this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) {
      
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.NOT_APPLY;
      return;
    }
    if (qcInspectionRequestItemOption.doubleValue == null) {
      
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PENDING;
      return;
    }

    // check if the user's input meet the expectation
    if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.EQUAL &&
      qcInspectionRequestItemOption.doubleValue == +qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.GREAT_THAN &&
      qcInspectionRequestItemOption.doubleValue > +qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.GREAT_OR_EQUAL &&
      qcInspectionRequestItemOption.doubleValue >= +qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.LESS_THAN &&
      qcInspectionRequestItemOption.doubleValue < +qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.LESS_OR_EQUAL &&
      qcInspectionRequestItemOption.doubleValue <= +qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.FAIL;
    }    
  }
  
  // for string type question, we will allow to compare the result to the expectation by 
  // equals / like
  resetQCInspectionRequestItemSTRINGOptionResult(qcInspectionRequestItemOption: QCInspectionRequestItemOption) {

    if (this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) {
      
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.NOT_APPLY;
      return;
    }
    // make sure the user input something
    if (qcInspectionRequestItemOption.stringValue == null) {
      
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PENDING;
      return;
    }

    // check the user's input with the expectation
    if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.EQUAL &&
      qcInspectionRequestItemOption.stringValue == qcInspectionRequestItemOption.qcRuleItem.expectedValue) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    // if the comparator is like, then make sure the user's input is part of the expectation
    else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemComparator == QCRuleItemComparator.LIKE &&
      qcInspectionRequestItemOption.qcRuleItem.expectedValue.trim().toLowerCase().includes(qcInspectionRequestItemOption.stringValue.trim().toLowerCase())) {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.PASS;
    }
    else {
      qcInspectionRequestItemOption.qcInspectionResult = QCInspectionResult.FAIL;
    }    
  }

  // check the result of the option based on the user's input
  resetQCInspectionRequestItemOptionResult(qcInspectionRequestItemOption: QCInspectionRequestItemOption) {
     if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemType === QCRuleItemType.YESNO) {
       this.resetQCInspectionRequestItemYESNOOptionResult(qcInspectionRequestItemOption);
     }
     else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemType === QCRuleItemType.NUMBER) {
      this.resetQCInspectionRequestItemNUMBEROptionResult(qcInspectionRequestItemOption);
       
     }
     else if (qcInspectionRequestItemOption.qcRuleItem.qcRuleItemType === QCRuleItemType.STRING) {
      this.resetQCInspectionRequestItemSTRINGOptionResult(qcInspectionRequestItemOption);
       
     }
  }
  qcInspectionRequestItemOptionChanged(qcInspectionRequestItem: QCInspectionRequestItem, 
    qcInspectionRequestItemOption: QCInspectionRequestItemOption){
 
      // update the item option's result first, 
      this.resetQCInspectionRequestItemOptionResult(qcInspectionRequestItemOption);

      //console.log(`after reset the option ${qcInspectionRequestItemOption.qcRuleItem.checkPoint}`);

      qcInspectionRequestItem.qcInspectionRequestItemOptions.forEach(
        qcInspectionRequestItemOption => {
          console.log(`==> ${qcInspectionRequestItemOption.qcRuleItem.checkPoint} : ${qcInspectionRequestItemOption.qcInspectionResult}`);
        }
      )

      // update the qc inspection request  based on the result of all item options
      if (!qcInspectionRequestItem.qcInspectionRequestItemOptions.some(
            qcInspectionRequestItemOption => qcInspectionRequestItemOption.qcInspectionResult !== QCInspectionResult.PENDING
          )) {
            // all options are pending, let's set the result to pending
            qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.PENDING
      }
      else if (qcInspectionRequestItem.qcInspectionRequestItemOptions.some(
          qcInspectionRequestItemOption => qcInspectionRequestItemOption.qcInspectionResult !== QCInspectionResult.PASS &&
              qcInspectionRequestItemOption.qcInspectionResult !== QCInspectionResult.NOT_APPLY
        )) {
          // at least one option fail, let's make the whole request as fail
          qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.FAIL
      }
      else {        
          qcInspectionRequestItem.qcInspectionResult = QCInspectionResult.PASS
      }
    this.refreshInventoryQCResultMap();
  }
   
  getImageUrl(itemSampling: ItemSampling, imageFileName: string): string {
    return `${environment.api.baseUrl}inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${itemSampling.item?.id}/${itemSampling.number}/${imageFileName}`
  }

  notApplyQCInspectionRequestItemOptionChanged(qcInspectionRequestItem: QCInspectionRequestItem, 
    qcInspectionRequestItemOption: QCInspectionRequestItemOption, checked: boolean) {
    // console.log(`checked: ${checked}`)
    // console.log(`this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id): ${this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)}`)
    if (checked && !this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) { 
       // console.log(`add ${qcInspectionRequestItemOption.id} to the set`) 
        this.notApplyQCInspectionRequestItemOptionSet.add(qcInspectionRequestItemOption.id); 
    }
    else if (!checked && this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) {
        // console.log(`remove ${qcInspectionRequestItemOption.id} from the set`) 
        this.notApplyQCInspectionRequestItemOptionSet.delete(qcInspectionRequestItemOption.id); 
    }

    this.qcInspectionRequestItemOptionChanged(qcInspectionRequestItem, qcInspectionRequestItemOption);
  }
}
