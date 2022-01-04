import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Inventory } from '../../inventory/models/inventory';
import { ItemSampling } from '../../inventory/models/item-sampling';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ItemSamplingService } from '../../inventory/services/item-sampling.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionRequestItem } from '../models/qc-inspection-request-item';
import { QCInspectionRequestItemOption } from '../models/qc-inspection-request-item-option';
import { QcInspectionRequestType } from '../models/qc-inspection-request-type';
import { QCInspectionResult } from '../models/qc-inspection-result';
import { QCRuleItemComparator } from '../models/qc-rule-item-comparator';
import { QCRuleItemType } from '../models/qc-rule-item-type';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';

@Component({
  selector: 'app-qc-inspect-by-request',
  templateUrl: './inspect-by-request.component.html',
  styleUrls: ['./inspect-by-request.component.less'],
})
export class QcInspectByRequestComponent implements OnInit {
  stepIndex = 0;
  pageTitle: string = ""; 
  isSpinning = false; 
  qcInspectionRequest?: QcInspectionRequest;
  
  qcRuleItemTypes = QCRuleItemType;
  qcInspectionResults = QCInspectionResult;
  itemSampling?: ItemSampling;
  notApplyQCInspectionRequestItemOptionSet = new Set();
  isCollapse = false;
  
  showQCInventoryFlag = false;
  inputLpn = "";


  constructor(private http: _HttpClient, 
    private inventoryService: InventoryService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private itemSamplingService: ItemSamplingService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('qc-inspection');
 
  }
  
  ngOnInit(): void {
 
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.ids) { 
        this.qcInspectionRequestService.getQCInspectionRequest(params.ids)
        .subscribe({
          next: (qcInspectionRequestRes) => {
            this.qcInspectionRequest = qcInspectionRequestRes;
            
            this.loadItemSampling(this.qcInspectionRequest.item?.id, this.qcInspectionRequest.item?.name);
              
          }
        })
      } 
    }); 
}
loadItemSampling(itemId?: number, itemName?: string) { 
    this.itemSamplingService.getItemSamplings(undefined, itemName, itemId, undefined, true).subscribe(
      {
        next: (itemSamplingRes) => {
          // we should only get at most one enabled item sampling for each item
          if (itemSamplingRes.length === 1) {
            this.itemSampling = itemSamplingRes[0];
          }
        }
      }
    )
 
}

toggleCollapse(): void {
  this.isCollapse = !this.isCollapse;
}
 

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    this.isSpinning = true;
    
    // if everything is pending, then the overall result is pending so we can inspect again later on
    // otherwise, if we have one fail, the overall result is fail
    if (!this.qcInspectionRequest!.qcInspectionRequestItems.some(
            qcInspectionRequestItem =>  qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PENDING
            )) {
              this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.PENDING;
    }
    else if (this.qcInspectionRequest!.qcInspectionRequestItems.some(
          qcInspectionRequestItem => qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PASS
          )) {
            // at least one option fail, let's make the whole request as fail
            this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.FAIL
    }
    else {
            
          this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.PASS
    }
        
       
    let qcInspectionRequests: QcInspectionRequest[] = [];
    qcInspectionRequests.push(this.qcInspectionRequest!);
    this.qcInspectionRequestService.saveQCInspectionRequest(qcInspectionRequests).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.router.navigateByUrl(`/qc/inspection?number=${this.qcInspectionRequest?.number}&type=${QcInspectionRequestType.BY_ITEM}&result=${this.qcInspectionRequest?.qcInspectionResult}`);
        }, 2500);
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

      // console.log(`after reset the option ${qcInspectionRequestItemOption.qcRuleItem.checkPoint}`);

      /**
       * 
      qcInspectionRequestItem.qcInspectionRequestItemOptions.forEach(
        qcInspectionRequestItemOption => {
          console.log(`==> ${qcInspectionRequestItemOption.qcRuleItem.checkPoint} : ${qcInspectionRequestItemOption.qcInspectionResult}`);
        }
      )
       */

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
      this.refreshOverallQCResult();
  }

  refreshOverallQCResult() {
    this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.PASS;
    if (!this.qcInspectionRequest?.qcInspectionRequestItems.some(
          qcInspectionRequestItem =>  qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PENDING
          )) {
            this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.PENDING;
    }
    else if (this.qcInspectionRequest!.qcInspectionRequestItems.some(
              qcInspectionRequestItem => qcInspectionRequestItem.qcInspectionResult !== QCInspectionResult.PASS
              )) {
        // at least one option fail, let's make the whole request as fail
        this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.FAIL
    }
    else {
        
      this.qcInspectionRequest!.qcInspectionResult = QCInspectionResult.PASS
    }
  }
   
  getImageUrl(itemSampling: ItemSampling, imageFileName: string): string {
    return `${environment.api.baseUrl}inventory/item-sampling/images/${this.warehouseService.getCurrentWarehouse().id}/${itemSampling.item?.id}/${itemSampling.number}/${imageFileName}`
  }

  notApplyQCInspectionRequestItemOptionChanged(qcInspectionRequestItem: QCInspectionRequestItem, 
    qcInspectionRequestItemOption: QCInspectionRequestItemOption, checked: boolean) {
    
    if (checked && !this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) { 
        this.notApplyQCInspectionRequestItemOptionSet.add(qcInspectionRequestItemOption.id); 
    }
    else if (!checked && this.notApplyQCInspectionRequestItemOptionSet.has(qcInspectionRequestItemOption.id)) {
        this.notApplyQCInspectionRequestItemOptionSet.delete(qcInspectionRequestItemOption.id); 
    }

    this.qcInspectionRequestItemOptionChanged(qcInspectionRequestItem, qcInspectionRequestItemOption);
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("lpn"), index: 'lpn',   },
    { title: this.i18n.fanyi("item"), index: 'item.name',  }, 
    { title: this.i18n.fanyi("item.description"), index: 'item.description',  }, 
    { title: this.i18n.fanyi("quantity"), index: 'quantity',  }, 
    { title: this.i18n.fanyi("status"), index: 'inventoryStatus.name',  }, 

  ];

  addLpn() {
    // only proceed if the user input an lpn
    if (this.inputLpn != '') {

      this.isSpinning = true;
      this.qcInspectionRequestService.validateLPNForInspectionByQCRequest(this.qcInspectionRequest!.id!, this.inputLpn).subscribe(
        {
          next: (inventoryRes) => {
            if (inventoryRes.length === 0) {
              
              this.messageService.error("message.lpn.not-exists");
              this.isSpinning = false;
            }
            // make sure the inventory has the right item 
            else if (inventoryRes.some(inventory => inventory.item?.id != this.qcInspectionRequest?.item?.id )) {
              this.messageService.error("message.item.not-match");
              this.isSpinning = false;
            }
            else {
              // remove the duplicated inventory record
              inventoryRes = inventoryRes.filter(
                inventory => !this.qcInspectionRequest?.inventories.some(addedInventory => addedInventory.id === inventory.id)
              );
              if (inventoryRes.length > 0) {
  
                this.qcInspectionRequest!.inventories = [...this.qcInspectionRequest!.inventories, ...inventoryRes];
              }
              this.messageService.error("message.lpn.added");
              this.inputLpn = '';
              this.isSpinning = false;

            }

          },
          error: () => this.isSpinning = false
        }
      )
    }
  }
}