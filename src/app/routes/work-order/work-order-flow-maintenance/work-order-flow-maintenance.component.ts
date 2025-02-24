import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferChange, TransferItem } from 'ng-zorro-antd/transfer';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { WorkOrder } from '../models/work-order';
import { WorkOrderFlow } from '../models/work-order-flow';
import { WorkOrderFlowService } from '../services/work-order-flow.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
    selector: 'app-work-order-work-order-flow-maintenance',
    templateUrl: './work-order-flow-maintenance.component.html',
    standalone: false
})
export class WorkOrderWorkOrderFlowMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  stepIndex = 0;
  currentWorkOrderFlow?: WorkOrderFlow;

  // work orders candidate for the flow
  workOrderCandidates: WorkOrder[] = [];
  allWorkOrders: WorkOrder[] = [];
  workOrderNumberCandidates: TransferItem[] = [];

  
  isSpinning = false;  

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private messageService: NzMessageService,
    private router: Router, 
    private warehouseService: WarehouseService, 
    private companyService: CompanyService,
    private workOrderFlowService: WorkOrderFlowService,
    private workOrderService: WorkOrderService,
    ) { 
    
    this.pageTitle = this.i18n.fanyi('page.work-order-flow.new'); 
  }

  ngOnInit(): void {
    this.pageTitle = this.i18n.fanyi('page.work-order-flow.new');
    this.titleService.setTitle(this.i18n.fanyi('page.work-order-flow.new'));
    this.stepIndex = 0;

    this.isSpinning = true;
    this.workOrderFlowService.getWorkOrderFlowCandidate().subscribe(
      {
        next: (workOrderNumberRes) => {
          workOrderNumberRes.forEach(
            workOrderNumber => {

              this.workOrderNumberCandidates.push({
                key: workOrderNumber,
                title: workOrderNumber,
                description: workOrderNumber
              });
            }
          );
          
           this.isSpinning = false;
        },
        error: () => this.isSpinning = false
      }
    )
  
  }

  
  getEmptyWorkOrderFlow(): WorkOrderFlow {
    return {      
 
      name: "",
      description: "",
      lines: []
    };
  }
  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    if(this.stepIndex == 0) {
      if (this.workOrderCandidates.length < 2) {
        this.messageService.error("please at least 2 work orders to group them into a flow");
        return;
      }
    }
    this.stepIndex += 1;
  }
  
  confirm(): void {

  }

  filterOption(inputValue: string, item: any): boolean {
    return item.description.indexOf(inputValue) > -1;
  }
  
  search(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  select(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  change(event: TransferChange): void {
    if (event.from == "left" && event.to == "right") {
      this.isSpinning = true;
      this.workOrderService.getWorkOrders(event.list[0].title, 
        undefined, undefined, undefined).subscribe({
          next: (workOrderRes) => {
            this.workOrderCandidates = [...this.workOrderCandidates, 
                ...workOrderRes
            ];
            this.isSpinning = false;
          }, 
          error: () => this.isSpinning = false
        });
    }
    else if (event.from == "right" && event.to == "left") {

      this.workOrderCandidates = this.workOrderCandidates.filter(
        workOrder => workOrder.number != event.list[0].title
      );
    }
    console.log('nzChange', event);
  }

}
