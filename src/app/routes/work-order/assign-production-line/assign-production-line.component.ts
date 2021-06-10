import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';
import { ProductionLine } from '../models/production-line';
import { WorkOrder } from '../models/work-order';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderService } from '../services/work-order.service';

interface ProductionLineAssignment {
  productionLine: ProductionLine;
  productionLineId: number;
  quantity: number;
};

@Component({
  selector: 'app-work-order-assign-production-line',
  templateUrl: './assign-production-line.component.html',
})
export class WorkOrderAssignProductionLineComponent implements OnInit {

  productionLineList: TransferItem[] = [];
  pageTitle: string;
  currentProductionLineAssignment: ProductionLineAssignment[] = [];
  availableProductionLines: ProductionLine[] = [];
  
  unassignedProductionLineText: string;
  assignedProductionLineText: string;

  workOrder!: WorkOrder; 
  stepIndex = 0;

  constructor(
    private fb: FormBuilder,
    private i18n: I18NService, 
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    ) { 
      this.pageTitle = this.i18n.fanyi('menu.main.work-order.assign-production-line');
      this.unassignedProductionLineText = this.i18n.fanyi('production-line.unassigned');
      this.assignedProductionLineText = this.i18n.fanyi('production-line.assigned');
    }

  ngOnInit(): void { 

    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.assign-production-line'));
    

    

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.workOrderId) {
        this.workOrderService.getWorkOrder(params.workOrderId).subscribe(
          workOrderRes => {
            this.workOrder = workOrderRes;
            this.initProductionLineAssignment();
          }
        )
      }
    });
  }
  
  initProductionLineAssignment(): void {
    // display the lines that already assigned to the current work order
    this.workOrder.productionLineAssignments?.forEach(
      productionLineAssignment => {
        this.productionLineList = [...this.productionLineList, {
          key: productionLineAssignment.productionLine.id!.toString(),
          title: productionLineAssignment.productionLine.name,
          description: productionLineAssignment.productionLine.name,
          direction: 'right'
        
        }];
      }
    )
    // Get all menus and accessible menus by role
    this.productionLineService.getAvailableProductionLines(this.workOrder.itemId).subscribe(productionLines => {
      this.availableProductionLines = productionLines; 
      productionLines.forEach(productionLine => {
        
        this.productionLineList = [...this.productionLineList, {
          key: productionLine.id!.toString(),
          title: productionLine.name,
          description: productionLine.name,
          direction: this.workOrder.productionLineAssignments?.some(productionLineAssignment => +productionLineAssignment.productionLine.id! === +productionLine.id!) ? 'right' : undefined,
        
        }];

      })

    });
  }


  

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    if (this.stepIndex === 0) {
 
      // if we are in the first step, save the 
      // selected production line temporary
      this.currentProductionLineAssignment = [];
      this.productionLineList.filter(productionLine => productionLine.direction === 'right')
        .forEach(productionLine => { 
          this.currentProductionLineAssignment = [...this.currentProductionLineAssignment,
            {
              productionLine: this.getProductionLineById(productionLine.key)!,
              productionLineId: productionLine.key,
              quantity: 0,
            }];
        });
      // average the work quantity into assigned production line, evenly
      this.setupDefaultProductionLineQuantity();
    }
    this.stepIndex += 1;

  }

  getProductionLineById(id:number): ProductionLine | undefined {
 
    var productionLine =  this.availableProductionLines.find(productionLine => { 
      return +productionLine.id! === +id
    });  


    return productionLine;
  }

  setupDefaultProductionLineQuantity(){
    var defaultQuantityPerLine = Math.floor(
      this.workOrder.expectedQuantity! / this.currentProductionLineAssignment.length
    );
    var leftOverQuantity = this.workOrder.expectedQuantity! - (defaultQuantityPerLine * this.currentProductionLineAssignment.length);
    this.currentProductionLineAssignment.forEach(productionLineAssignment => {
      productionLineAssignment.quantity = defaultQuantityPerLine
    });
    this.currentProductionLineAssignment[this.currentProductionLineAssignment.length - 1].quantity = defaultQuantityPerLine + leftOverQuantity;

  }

  confirm() {
    const productionLineIds = 
        this.currentProductionLineAssignment
          .map(productionLineAssignment => productionLineAssignment.productionLineId).join(",");
    const quantites = 
        this.currentProductionLineAssignment
          .map(productionLineAssignment => productionLineAssignment.quantity).join(",");
    
      this.workOrderService.assignProductionLine(this.workOrder.id!, productionLineIds, quantites)
        .subscribe(productionLineAssignments => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.router.navigateByUrl(`/work-order/work-order?number=${this.workOrder.number}`);
          }, 2500);
      }); 
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

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);
  }

}
