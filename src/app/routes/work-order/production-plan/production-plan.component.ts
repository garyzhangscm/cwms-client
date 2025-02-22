import { formatDate } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
    standalone: false
})
export class WorkOrderProductionPlanComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<ProductionPlan>> = [
    {
      name: 'production-plan.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionPlan, b: ProductionPlan) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionPlan, b: ProductionPlan) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.expectedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionPlan, b: ProductionPlan) => this.utilService.compareNullableNumber(a.expectedQuantity, b.expectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.inprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionPlan, b: ProductionPlan) => this.utilService.compareNullableNumber(a.inprocessQuantity, b.inprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'production-plan.producedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ProductionPlan, b: ProductionPlan) => this.utilService.compareNullableNumber(a.producedQuantity, b.producedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];
  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  expandSet = new Set<number>();

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private modalService: NzModalService,
    private workOrderService: WorkOrderService,
    private message: NzMessageService,
    private productionPlanService: ProductionPlanService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/work-order/production-plan").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                             
   }

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  newWorkOrder: WorkOrder = {
    id: undefined,
    number: undefined,
    workOrderLines: [],
    workOrderInstructions: [],
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
      .getProductionPlans(this.searchForm.value.number.value, this.searchForm.value.item.value)
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

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayProductionPlans!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: ProductionPlan[]): void {
    this.listOfDisplayProductionPlans! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayProductionPlans!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayProductionPlans!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }


  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-order.production-plan'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
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
      itemId: undefined,
      item: undefined,
      workOrderKPIs: [],
      workOrderByProducts: [],
      productionPlanLine,

      warehouseId: undefined,
      warehouse: undefined,
      expectedQuantity: undefined,
      producedQuantity: undefined,
      assignments: [],
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

  workOrderNumberOnBlur(event: Event): void {
    this.newWorkOrder.number = (event.target as HTMLInputElement).value;
  }

  showWorkOrders(productionPlan: ProductionPlan): void {
    this.workOrderService.getWorkOrdersByProductionPlan(productionPlan.id!).subscribe(workOrdersRes => {
      this.mapOfWorkOrders[productionPlan.id!] = [...this.calculateWorkOrderLineTotalQuantities(workOrdersRes)];
    });
  }
  createWorkOrderFromProductionPlanLine(productionPlan: ProductionPlan): void { }
  showProductionPlanDetails(productionPlan: ProductionPlan): void {
    if (this.expandSet.has(productionPlan.id!)) {
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
