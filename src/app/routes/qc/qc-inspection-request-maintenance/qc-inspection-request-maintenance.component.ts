import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange, TransferItem } from 'ng-zorro-antd/transfer';

import { ReceiptService } from '../../inbound/services/receipt.service';
import { ItemService } from '../../inventory/services/item.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QCInspectionRequestItem } from '../models/qc-inspection-request-item';
import { QcInspectionRequestType } from '../models/qc-inspection-request-type';
import { QCInspectionResult } from '../models/qc-inspection-result';
import { QCRule } from '../models/qc-rule';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';
import { QcRuleService } from '../services/qc-rule.service';

@Component({
    selector: 'app-qc-qc-inspection-request-maintenance',
    templateUrl: './qc-inspection-request-maintenance.component.html',
    standalone: false
})
export class QcQcInspectionRequestMaintenanceComponent implements OnInit {
  currentQCInspectionRequest!: QcInspectionRequest;
  stepIndex = 0;
  pageTitle: string;
  newQCInspectionRequest = true;
  filterBy = "None";
  qcInspectionRequestNumberValidateStatus = 'warning'; 
  
  qcRuleList: TransferItem[] = [];
  allQCRules: QCRule[] = [];
  assignedQCRuleIds: number[] = [];
  
  unassignedQCRuleText: string = "";
  assignedQCRuleText: string = "";
  isSpinning = false;

  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private messageService: NzMessageService,
    private router: Router,
    private itemService: ItemService,
    private workOrderService: WorkOrderService,
    private receiptService: ReceiptService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private qcRuleService: QcRuleService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.qc.qc-inspection-request-maintenance');

    this.currentQCInspectionRequest = this.createEmptyQCInspectionRequest();
  }

  createEmptyQCInspectionRequest(): QcInspectionRequest {
    return {

      number:  "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      inventories: [],
      qcInspectionRequestItems: [],
      qcInspectionResult: QCInspectionResult.PENDING,
      qcQuantity:0 ,
      documentUrls: "",
  
       type: QcInspectionRequestType.BY_ITEM // now we will only support generate QC by item

    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.isSpinning = true;
        this.qcInspectionRequestService.getQCInspectionRequest(params.id)
          .subscribe(qcInspectionRequestRes => {
            this.currentQCInspectionRequest = qcInspectionRequestRes;

            this.newQCInspectionRequest = false;
            this.isSpinning = false;
          });
      }
      else { 
        this.newQCInspectionRequest = true;
      }
    });
    
    this.loadQCRules();

  }

  loadQCRules() {

    this.qcRuleService.getQCRules().subscribe({
      next: (qcRuleRes) =>  {
        this.allQCRules = qcRuleRes;
        this.qcRuleList = [];
        this.assignedQCRuleIds = [];
        this.allQCRules.forEach(qcRule => {
          const qcRuleAssigned = 
              this.currentQCInspectionRequest!.qcInspectionRequestItems!.some(
                qcInspectionRequestItem => qcInspectionRequestItem.qcRule.id === qcRule.id!)
   
          this.qcRuleList.push({
            key: qcRule.id!.toString(),
            title: `${qcRule.name}`,
            description: `${qcRule.description}`,
            direction: qcRuleAssigned ? 'right' : undefined,
          });
        });
      }
    })
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

      this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}&type=${QcInspectionRequestType.BY_ITEM}&result=${QCInspectionResult.PENDING}`);
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

      this.isSpinning = true;
      this.qcInspectionRequestService.addQCInspectionRequest(this.currentQCInspectionRequest)
        .subscribe(
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.isSpinning = false;
                this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}&type=${QcInspectionRequestType.BY_ITEM}&result=${QCInspectionResult.PENDING}`);
              }, 500);
            }
          });
    }
    else {

      this.isSpinning = true;
      this.qcInspectionRequestService.changeQCInspectionRequest(this.currentQCInspectionRequest)
        .subscribe(
          {
            next: () => {

              this.messageService.success(this.i18n.fanyi('message.save.complete'));
              setTimeout(() => {
                this.isSpinning = false;
                this.router.navigateByUrl(`/qc/inspection?number=${this.currentQCInspectionRequest.number}&type=${QcInspectionRequestType.BY_ITEM}&result=${QCInspectionResult.PENDING}`);
              }, 500);
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

  
  workOrderNumberChanged(event: Event) {
    const workOrderNumber = (event.target as HTMLInputElement).value.trim();
    if (workOrderNumber.length > 0) {

      this.workOrderService.getWorkOrders(workOrderNumber).subscribe(
        {
          next: (workOrderRes) => {
            if (workOrderRes.length === 1) {
              console.log(`work order number is changed to ${workOrderRes[0].number}`);
              this.currentQCInspectionRequest.workOrder = workOrderRes[0]; 
              this.currentQCInspectionRequest.workOrderId = workOrderRes[0].id; 
            }
          }
        }
      )
    }
  }
  

  processWorkOrderQueryResult(selectedWorkOrderNumber: any): void {
    console.log(`start to query with work order number ${selectedWorkOrderNumber}`);
    this.workOrderService.getWorkOrders(selectedWorkOrderNumber).subscribe(
      {
        next: (workOrderRes) => {
          if (workOrderRes.length === 1) {
            this.currentQCInspectionRequest.workOrder = workOrderRes[0]; 
            this.currentQCInspectionRequest.workOrderId = workOrderRes[0].id; 
          }
        }
      }
    )
    
  }
  
  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: TransferChange): void { 
    const listKeys = ret.list.map(l => l.key); 

    if (ret.from === 'left' && ret.to === 'right') {
      // assign the qc rule 
      const qcRules: QCRule[] = this.allQCRules.filter(
        qcRule => listKeys.some(key => qcRule.id === +key)
      ); 
      let assignedQCInspectionRequestItems : QCInspectionRequestItem[] = []; 
      qcRules.forEach(
        qcRule => {
          // create a request item with this qc rule
          let assignedQCInspectionRequestItem: QCInspectionRequestItem = {
            qcRule: qcRule,
            qcInspectionResult: QCInspectionResult.PENDING,
            qcInspectionRequestItemOptions: []
          };
          // and assign each qc rule item to this request
          qcRule.qcRuleItems.forEach(
            qcRuleItem => {
              assignedQCInspectionRequestItem.qcInspectionRequestItemOptions = [
                ...assignedQCInspectionRequestItem.qcInspectionRequestItemOptions, 
                {
                  qcRuleItem: qcRuleItem,
                  qcInspectionResult: QCInspectionResult.PENDING,
                }
              ]
            }
          );
          // add the request item to the request
          assignedQCInspectionRequestItems = [...assignedQCInspectionRequestItems, assignedQCInspectionRequestItem];
        }
      );
       
      this.currentQCInspectionRequest.qcInspectionRequestItems = [
        ...this.currentQCInspectionRequest.qcInspectionRequestItems, ...assignedQCInspectionRequestItems
      ];
    }
    else if (ret.from === 'right' && ret.to === 'left') {      
      this.currentQCInspectionRequest.qcInspectionRequestItems =  
          this.currentQCInspectionRequest.qcInspectionRequestItems.filter(
            qcInspectionRequestItem => listKeys.some(key => qcInspectionRequestItem.qcRule.id === +key) === false
          ) 
    }
    
    
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [

    { title: this.i18n.fanyi("name"), index: 'qcRule.name',   },
    { title: this.i18n.fanyi("description"), index: 'qcRule.description',  }, 

  ];

}
