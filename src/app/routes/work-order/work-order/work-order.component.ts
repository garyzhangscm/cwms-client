import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { WorkOrderService } from '../services/work-order.service';
import { WorkOrder } from '../models/work-order';
import { BillOfMaterial } from '../models/bill-of-material';

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
    private message: NzMessageService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;
  searching = false;
  allocating = false;

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
        console.log(`workOrderRes\n${JSON.stringify(workOrderRes)}`);
        this.listOfAllWorkOrder = workOrderRes;
        this.listOfDisplayWorkOrder = workOrderRes;
        this.searching = false;
      });
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
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.workOrderService.removeWorkOrders(selectedWorkOrders).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.action.success'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
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
  allocateWorkOrder(workOrder: WorkOrder) {
    this.allocating = true;
    this.workOrderService.allocateWorkOrder(workOrder).subscribe(workOrderRes => {
      this.message.success(this.i18n.fanyi('message.allocate.success'));
      this.allocating = false;
    });
  }
}
