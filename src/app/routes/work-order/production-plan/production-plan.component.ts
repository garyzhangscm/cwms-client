import { formatDate } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ProductionPlan } from '../models/production-plan';
import { ProductionPlanLine } from '../models/production-plan-line';
import { WorkOrder } from '../models/work-order';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { ProductionPlanService } from '../services/production-plan.service';
import { WorkOrderService } from '../services/work-order.service';

@Component({
  selector: 'app-work-order-production-plan',
  templateUrl: './production-plan.component.html',
  styleUrls: ['./production-plan.component.less'],
})
export class WorkOrderProductionPlanComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private workOrderService: WorkOrderService,
    private message: NzMessageService,
    private productionPlanService: ProductionPlanService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
  ) {}

  // Form related data and functions
  searchForm!: FormGroup;
  newWorkOrder: WorkOrder = {
    id: undefined,
    number: undefined,
    workOrderLines: [],
    workOrderInstructions:  [],
    productionLine: undefined,
    itemId: undefined,
    item: undefined,
    workOrderKPIs: [],
    workOrderByProducts: [],

    warehouseId: undefined,
    warehouse: undefined,
    expectedQuantity: undefined,
    producedQuantity: undefined,
    assignments: [],
    status: WorkOrderStatus.PENDING,
  };
  searching = false;
  searchResult = '';

  newWorkOrderModal!: NzModalRef;

  // Table data for display
  listOfAllProductionPlans: ProductionPlan[] = [];
  listOfDisplayProductionPlans: ProductionPlan[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};
  mapOfWorkOrders: { [key: string]: WorkOrder[] } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllProductionPlans = [];
    this.listOfDisplayProductionPlans = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';
    this.productionPlanService
      .getProductionPlans(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
      .subscribe(
        productionPlanRes => {
          this.listOfAllProductionPlans = productionPlanRes;
          this.listOfDisplayProductionPlans = productionPlanRes;
          productionPlanRes.forEach(productionPlan => {
            this.calculateProductionPlanTotalQuantity(productionPlan);
            this.showProductionPlanDetails(productionPlan);
          });

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: productionPlanRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayProductionPlans.every(item => this.mapOfCheckedId[item.id!]);
    this.indeterminate =
      this.listOfDisplayProductionPlans.some(item => this.mapOfCheckedId[item.id!]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayProductionPlans.forEach(item => (this.mapOfCheckedId[item.id!] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data 
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-plan'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  openNewWorkOrderModal(
    productionPlanLine: ProductionPlanLine,
    tplCreatingWorkOrderModalTitle: TemplateRef<{}>,
    tplCreatingWorkOrderModalContent: TemplateRef<{}>,
  ): void {
    this.newWorkOrder = {
      id: undefined,
      number: undefined,
      workOrderLines: [],
      workOrderInstructions: [],
      productionLine: undefined,
      itemId: undefined,
      item: undefined,
      workOrderKPIs: [],
      workOrderByProducts: [],
      productionPlanLine,

      warehouseId: undefined,
      warehouse: undefined,
      expectedQuantity: undefined,
      producedQuantity: undefined,
      assignments:  [],
      status: WorkOrderStatus.PENDING,
    };
    // show the model
    this.newWorkOrderModal = this.modalService.create({
      nzTitle: tplCreatingWorkOrderModalTitle,
      nzContent: tplCreatingWorkOrderModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.newWorkOrderModal.destroy();
        this.search();
      },
      nzOnOk: () => {
        this.createWorkOrder(productionPlanLine, this.newWorkOrder);
      },
      nzWidth: 1000,
    });
  }
  createWorkOrder(productionPlanLine: ProductionPlanLine, workOrder: WorkOrder): void {
    this.productionPlanService.createWorkOrder(productionPlanLine, workOrder).subscribe(res => {
      this.message.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  workOrderNumberOnBlur(workOrderNumber: string): void {
    this.newWorkOrder.number = workOrderNumber;
  }

  showWorkOrders(productionPlan: ProductionPlan): void {
    this.workOrderService.getWorkOrdersByProductionPlan(productionPlan.id!).subscribe(workOrdersRes => {
      this.mapOfWorkOrders[productionPlan.id!] = [...this.calculateWorkOrderLineTotalQuantities(workOrdersRes)];
    });
  }
  createWorkOrderFromProductionPlanLine(productionPlan: ProductionPlan): void {}
  showProductionPlanDetails(productionPlan: ProductionPlan): void {
    if (this.mapOfExpandedId[productionPlan.id!] === true) {
      this.showWorkOrders(productionPlan);
    }
  }

  calculateWorkOrderLineTotalQuantities(workOrders: WorkOrder[]): WorkOrder[] {
    workOrders.forEach(workOrder => {
      // init all the quantity to 0;
      this.calculateWorkOrderLineTotalQuantity(workOrder);
    });

    return workOrders;
  }

  calculateProductionPlanTotalQuantity(productionPlan: ProductionPlan): ProductionPlan {
    productionPlan.expectedQuantity = 0;
    productionPlan.inprocessQuantity = 0;
    productionPlan.producedQuantity = 0;
    productionPlan.productionPlanLines.forEach(productionPlanLine => {
      productionPlan.expectedQuantity! += productionPlanLine.expectedQuantity!;
      productionPlan.inprocessQuantity! += productionPlanLine.inprocessQuantity!;
      productionPlan.producedQuantity! += productionPlanLine.producedQuantity!;
    });
    return productionPlan;
  }
  calculateWorkOrderLineTotalQuantity(workOrder: WorkOrder): WorkOrder {
    workOrder.totalLineExpectedQuantity = 0;
    workOrder.totalLineOpenQuantity = 0;
    workOrder.totalLineInprocessQuantity = 0;
    workOrder.totalLineDeliveredQuantity = 0;
    workOrder.totalLineConsumedQuantity = 0;
    workOrder.workOrderLines.forEach(workOrderLine => {
      workOrder.totalLineExpectedQuantity = workOrder.totalLineExpectedQuantity! + workOrderLine.expectedQuantity!;
      workOrder.totalLineOpenQuantity = workOrder.totalLineOpenQuantity! + workOrderLine.openQuantity!;
      workOrder.totalLineInprocessQuantity = workOrder.totalLineInprocessQuantity! + workOrderLine.inprocessQuantity!;
      workOrder.totalLineDeliveredQuantity = workOrder.totalLineDeliveredQuantity! + workOrderLine.deliveredQuantity!;
      workOrder.totalLineConsumedQuantity = workOrder.totalLineConsumedQuantity! + workOrderLine.consumedQuantity!;
    });
    return workOrder;
  }
  canCreateWorkOrder(productionPlanLine: ProductionPlanLine): boolean {
    return (
      productionPlanLine.expectedQuantity! > productionPlanLine.inprocessQuantity! + productionPlanLine.producedQuantity!
    );
  }
}
