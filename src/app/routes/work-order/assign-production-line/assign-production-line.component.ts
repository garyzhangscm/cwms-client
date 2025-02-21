import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup , UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Mould } from '../models/mould';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { WorkOrder } from '../models/work-order';
import { MouldService } from '../services/mould.service';
import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderService } from '../services/work-order.service';


@Component({
    selector: 'app-work-order-assign-production-line',
    templateUrl: './assign-production-line.component.html',
    standalone: false
})
export class WorkOrderAssignProductionLineComponent implements OnInit {

  productionLineList: TransferItem[] = [];
  pageTitle: string;
  currentProductionLineAssignments: ProductionLineAssignment[] = [];
  availableProductionLines: ProductionLine[] = [];
  availableMoulds: Mould[] = [];

  unassignedProductionLineText: string;
  assignedProductionLineText: string;

  workOrder!: WorkOrder;
  stepIndex = 0;

  date = null;

  isSpinning = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private workOrderService: WorkOrderService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private mouldService: MouldService,
    private modal: NzModalService
  ) {
    this.pageTitle = this.i18n.fanyi('menu.main.work-order.assign-production-line');
    this.unassignedProductionLineText = this.i18n.fanyi('production-line.unassigned');
    this.assignedProductionLineText = this.i18n.fanyi('production-line.assigned');
  }

  ngOnInit(): void {

    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.assign-production-line'));


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.workOrderId) {
        this.isSpinning = true;
        this.workOrderService.getWorkOrder(params.workOrderId).subscribe(
          workOrderRes => {
            this.workOrder = workOrderRes;
            this.initProductionLineAssignment();
          }
        )
      }
    });


    // Load all moulds
    this.mouldService.getMoulds().subscribe(mouldsRes =>
      this.availableMoulds = mouldsRes);
  }

  initProductionLineAssignment(): void {
    // display the lines that already assigned to the current work order
    this.workOrder.productionLineAssignments?.forEach(
      productionLineAssignment => {
        this.productionLineList = [...this.productionLineList, {
          key: productionLineAssignment.productionLine.id!.toString(),
          title: productionLineAssignment.productionLine.name,
          description: productionLineAssignment.productionLine.name,
          direction: 'right',
          disabled: true  // you can't un-assign from this form. You will need to de-assign from the work order page / deassign button

        }];
      }
    )

    this.productionLineService.getAvailableProductionLines(this.workOrder.itemId).subscribe(productionLines => {
      this.availableProductionLines = productionLines;
      productionLines.filter(productionLine => {
        // only return the production line that is not assigned to current work order yet 
        return !this.workOrder.productionLineAssignments?.some(
          assignedProductionLine => {
            return assignedProductionLine.productionLine.id === productionLine.id
          }
        )
      }).forEach(productionLine => {

          this.productionLineList = [...this.productionLineList, {
            key: productionLine.id!.toString(),
            title: productionLine.name,
            description: productionLine.name,
            direction: this.workOrder.productionLineAssignments?.some(productionLineAssignment => +productionLineAssignment.productionLine.id! === +productionLine.id!) ? 'right' : undefined,

          }];

        })

        this.isSpinning = false;
    });
  }


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    if (this.stepIndex === 0) {

      // if we are in the first step, save the 
      // selected production line temporary
      this.currentProductionLineAssignments = [];
      this.productionLineList.filter(productionLine => productionLine.direction === 'right')
        .forEach(productionLine => {
          this.currentProductionLineAssignments = [...this.currentProductionLineAssignments,
          this.getProductionLineAssignment(this.getProductionLineById(productionLine.key)!)
          ];
        });
      // average the work quantity into assigned production line, evenly
      this.setupDefaultProductionLineQuantity();

      this.stepIndex += 1;
    }
    // else if (this.stepIndex === 1) {
      // flow to the next step becased on the result
      // of the quantity valication
      // we will not validate the production line quantity
      // any more
      // this.validateProductionLineQuantity(); 

    // }
    else {

      this.stepIndex += 1;
    }

  }
  // make sure the total quantity of the production line assignment match with the
  // work order's quantity
  validateProductionLineQuantity() {
    var totalAsisgnedQuantity: number = 0;

    this.currentProductionLineAssignments.forEach(
      productionLineAssignment => {
        totalAsisgnedQuantity = totalAsisgnedQuantity + +productionLineAssignment.quantity;
      }
    )
    // we will allow the user to assign less than the work order's total quantity
    // but raise a warning message for it 
    if (totalAsisgnedQuantity !== this.workOrder.expectedQuantity!) {
      this.modal.error({
        nzTitle: this.i18n.fanyi("error"),
        nzContent: this.i18n.fanyi("error.work-order.production-line-assignment.quantity-not-match")
      });
      // we won't flow the next step as the validation fail


    }
    /***
     * 
     * 
    if (totalAsisgnedQuantity > this.workOrder.expectedQuantity!) {
      this.modal.error({
        nzTitle: this.i18n.fanyi("error"),
        nzContent: this.i18n.fanyi("error.work-order.production-line-assignment.quantity-exceed")
      });
      // we won't flow the next step as the validation fail
      

    }
    else if (totalAsisgnedQuantity < this.workOrder.expectedQuantity!){
      
      this.modal.confirm({
        nzTitle: this.i18n.fanyi("warning"),
        nzContent: this.i18n.fanyi("warning.work-order.production-line-assignment.quantity-below"),
        nzOkText: this.i18n.fanyi("confirm"),
        nzOkType: 'primary',
        nzOkDanger: true,
        nzOnOk: () => this.stepIndex += 1,
        nzCancelText: this.i18n.fanyi("cancel"),
        // do nothing if the user choose to cancel

        // nzOnCancel: () => result = false,
      });
    }
     */
    else {
      // total quantity matches, flow to the next step
      this.stepIndex += 1;
    }


  }
  getProductionLineAssignment(productionLine: ProductionLine): ProductionLineAssignment {

    const existsingProductionAssignments: ProductionLineAssignment[] | undefined =
      this.workOrder.productionLineAssignments?.filter(
        productionLineAssignment => {
          return productionLineAssignment.productionLine.id === productionLine.id
        }
      );

    // if we already assigned this production to the current work order, 
    // return it
    // otherwise, return an empty assignment

    if (existsingProductionAssignments != undefined &&
      existsingProductionAssignments.length > 0) {
      return existsingProductionAssignments[0];
    }

    return {
      productionLine: productionLine,
      workOrder: this.workOrder,
      quantity: 0,
      openQuantity: 0,
      mould: undefined,
      dateRange: [], 
      lines: [],
    };
  }

  getProductionLineById(id: number): ProductionLine | undefined {

    console.log(`start to get production line by id: ${id}`);
    var productionLine = this.availableProductionLines.find(productionLine => {
      return +productionLine.id! === +id
    });

    if (productionLine === undefined) {
      // if we can't find it from available production line, it is probably already
      // assigned to current work order
      productionLine = this.workOrder.productionLineAssignments?.find(
        productionLineAssignment => productionLineAssignment.productionLine.id == id
      )?.productionLine;
    }


    return productionLine;
  }

  setupDefaultProductionLineQuantity() {
    this.currentProductionLineAssignments.forEach(
      productionLineAssignment => console.log(`production line: ${productionLineAssignment.productionLine.name}, already assigned? ${productionLineAssignment.id !== undefined}`)
    )
    var newProductionLineAssignment: ProductionLineAssignment[] = this.currentProductionLineAssignments
      .filter(productionLineAssignment => productionLineAssignment.id === undefined)

    console.log(`newProductionLineAssignment.length: ${newProductionLineAssignment.length} `)
    newProductionLineAssignment.forEach(
      productionLineAssignment => console.log(`production line: ${productionLineAssignment.productionLine.name} is newly assignment`)
    )

    // if we don't have any new assignment, then we don't have to anything. we can't change
    // the existsing assign. we will need to deassign it first, then assign it again.

    if (newProductionLineAssignment.length > 0) {

      // we will keep the original quantity as is and split the
      // remain quantity across the newly assigned production line
      var totalQuantityAlreadyAssigned = this.workOrder.productionLineAssignments
        ?.map(productionLineAssignment => productionLineAssignment.quantity)
        .reduce((acc, cur) => acc + cur, 0);

      console.log(`totalQuantityAlreadyAssigned: ${totalQuantityAlreadyAssigned} `)
      if (!totalQuantityAlreadyAssigned) {
        totalQuantityAlreadyAssigned = 0;
      }

      var defaultQuantityPerNewLine = Math.floor(
        (this.workOrder.expectedQuantity! - totalQuantityAlreadyAssigned) / newProductionLineAssignment.length
      );
      console.log(`defaultQuantityPerNewLine: ${defaultQuantityPerNewLine} `)
      var leftOverQuantity = (this.workOrder.expectedQuantity! - totalQuantityAlreadyAssigned)
        - (defaultQuantityPerNewLine * newProductionLineAssignment.length);
      console.log(`leftOverQuantity: ${leftOverQuantity} `)
      newProductionLineAssignment.forEach(productionLineAssignment => {
        productionLineAssignment.quantity = defaultQuantityPerNewLine
      });
      newProductionLineAssignment[newProductionLineAssignment.length - 1].quantity = defaultQuantityPerNewLine + leftOverQuantity;
    }

  }

  confirm() {
    this.isSpinning = true;
    const productionLineIds =
      this.currentProductionLineAssignments
        .map(productionLineAssignment => productionLineAssignment.productionLine.id).join(",");
    const quantites =
      this.currentProductionLineAssignments
        .map(productionLineAssignment => productionLineAssignment.quantity).join(",");

    this.workOrderService.assignProductionLine(this.workOrder.id!, this.currentProductionLineAssignments)
      .subscribe(productionLineAssignments => {
        this.messageService.success(this.i18n.fanyi('message.save.complete'));
        setTimeout(() => {
          this.isSpinning = false;

          this.router.navigateByUrl(`/work-order/work-order?number=${this.workOrder.number}`);
        }, 500);
      }, () => {
        this.isSpinning = false;
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


  mouldChanged(mouldName: string, productionLineAssignment: ProductionLineAssignment): void {
    this.mouldService.getMoulds(mouldName).subscribe(
      moulds => {
        if (moulds.length == 1) {
          productionLineAssignment.mould = moulds[0];
          console.log(`change mould to ${productionLineAssignment.mould.name} for ${productionLineAssignment.productionLine.name}`);
        }

      }
    )

  }


  onDateRangeChange(dateRange: Date[], productionLineAssignment: ProductionLineAssignment): void {
    console.log(`onDateRangeChange size: ${dateRange.length}`);
    console.log(`dateRange[0]: ${JSON.stringify(dateRange[0])}`);
    console.log(`dateRange[1]: ${JSON.stringify(dateRange[1])}`);
    productionLineAssignment.startTime = dateRange[0];
    productionLineAssignment.endTime = dateRange[1];
    productionLineAssignment.dateRange = dateRange;
  }

}
