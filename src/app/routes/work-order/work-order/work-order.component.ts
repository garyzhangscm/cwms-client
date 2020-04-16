import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrder } from '../models/work-order';

import { ProductionLineService } from '../services/production-line.service';
import { WorkOrderStatus } from '../models/work-order-status.enum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-work-order-work-order',
  templateUrl: './work-order.component.html',
  styleUrls: ['./work-order.component.less'],
})
export class WorkOrderWorkOrderComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private workOrderService: WorkOrderService,
    private messageService: NzMessageService,
    private productionLineService: ProductionLineService,
    private router: Router,
  ) {}
  workOrderStatus = WorkOrderStatus;
  // Form related data and functions
  searchForm: FormGroup;
  searching = false;
  allocating = false;

  availableProductionLines: Array<{ label: string; value: string }> = [];

  // Table data for display
  listOfAllWorkOrder: WorkOrder[] = [];
  listOfDisplayWorkOrder: WorkOrder[] = [];
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
  // list of record with allocation in process
  mapOfAllocationInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllWorkOrder = [];
    this.listOfDisplayWorkOrder = [];
  }

  search(): void {
    this.searching = true;
    this.workOrderService
      .getWorkOrders(this.searchForm.controls.number.value, this.searchForm.controls.item.value)
      .subscribe(workOrderRes => {
        this.listOfAllWorkOrder = this.calculateWorkOrderLineTotalQuantities(workOrderRes);
        this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
        this.searching = false;
      });
    this.loadAvailableProductionLine();
  }

  calculateWorkOrderLineTotalQuantities(workOrders: WorkOrder[]): WorkOrder[] {
    workOrders.forEach(workOrder => {
      // init all the quantity to 0;
      workOrder.totalLineExpectedQuantity = 0;
      workOrder.totalLineOpenQuantity = 0;
      workOrder.totalLineInprocessQuantity = 0;
      workOrder.totalLineConsumedQuantity = 0;
      workOrder.workOrderLines.forEach(workOrderLine => {
        workOrder.totalLineExpectedQuantity = workOrder.totalLineExpectedQuantity + workOrderLine.expectedQuantity;
        workOrder.totalLineOpenQuantity = workOrder.totalLineOpenQuantity + workOrderLine.openQuantity;
        workOrder.totalLineInprocessQuantity = workOrder.totalLineInprocessQuantity + workOrderLine.inprocessQuantity;
        workOrder.totalLineConsumedQuantity = workOrder.totalLineConsumedQuantity + workOrderLine.consumedQuantity;
      });
    });

    return workOrders;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayWorkOrder.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayWorkOrder.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayWorkOrder.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayWorkOrder = this.listOfAllWorkOrder.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayWorkOrder = this.listOfAllWorkOrder;
    }
  }

  removeSelectedWorkOrders(): void {
    // make sure we have at least one checkbox checked
    const selectedWorkOrders = this.getSelectedWorkOrders();
    if (selectedWorkOrders.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.workOrderService.removeWorkOrders(selectedWorkOrders).subscribe(res => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedWorkOrders(): WorkOrder[] {
    const selectedWorkOrders: WorkOrder[] = [];
    this.listOfAllWorkOrder.forEach((workOrder: WorkOrder) => {
      if (this.mapOfCheckedId[workOrder.id] === true) {
        selectedWorkOrders.push(workOrder);
      }
    });
    return selectedWorkOrders;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
    });
  }

  loadAvailableProductionLine() {
    this.availableProductionLines = [];
    // load all available production lines
    this.productionLineService.getAvailableProductionLines().subscribe(productionLineRes => {
      productionLineRes.forEach(productionLine =>
        this.availableProductionLines.push({ label: productionLine.name, value: productionLine.id.toString() }),
      );
    });
  }
  allocateWorkOrder(workOrder: WorkOrder) {
    this.mapOfAllocationInProcessId[workOrder.id] = true;
    this.workOrderService.allocateWorkOrder(workOrder).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[workOrder.id] = false;
      this.search();
    });
  }

  changeProductionLine(workOrder: WorkOrder, productionLineId: number) {
    this.workOrderService.changeProductionLine(workOrder, productionLineId).subscribe(workOrderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  isWorkOrderAllocatable(workOrder: WorkOrder): boolean {
    return workOrder.productionLine != null && workOrder.totalLineOpenQuantity > 0;
  }
  // The user is allowed to change the production line only when
  // the work order is in pending status
  isProductionLineChangable(workOrder: WorkOrder): boolean {
    return workOrder.status === WorkOrderStatus.PENDING;
  }

  printPickSheets(workOrder: WorkOrder) {
    this.mapOfPrintingInProcessId[workOrder.id] = true;
    this.workOrderService.printWorkOrderPickSheet(workOrder);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[workOrder.id] = false;
    }, 1000);
  }
  confirmPicks(workOrder: WorkOrder) {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=workOrder&id=${workOrder.id}`);
  }
}
