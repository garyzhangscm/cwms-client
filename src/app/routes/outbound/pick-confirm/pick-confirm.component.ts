import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { WorkOrderService } from '../../work-order/services/work-order.service';
import { WorkOrder } from '../../work-order/models/work-order';
import { Order } from '../models/order';
import { OrderService } from '../services/order.service';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';

@Component({
  selector: 'app-outbound-pick-confirm',
  templateUrl: './pick-confirm.component.html',
  styleUrls: ['./pick-confirm.component.less'],
})
export class OutboundPickConfirmComponent implements OnInit {
  pageTitle: string;
  lastPageUrl: string;
  type = 'NONE';
  number = '';
  workOrder: WorkOrder;
  order: Order;
  confirming = false;
  totalPickCountToConfirm = 0;

  // Table data for display
  listOfAllPicks: PickWork[] = [];
  listOfDisplayPicks: PickWork[] = [];
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
  // confirmed quantity for each picks

  // If all picks displayed are fully confirmed
  // we will disable the cancel button, confirm button
  // and the "check all" check box
  allPicksFullyConfirmed = false;

  mapOfConfirmedQuantity: { [key: string]: number } = {};

  constructor(
    private activatedRoute: ActivatedRoute,
    private i18n: I18NService,
    private titleService: TitleService,
    private modalService: NzModalService,
    private message: NzMessageService,
    private workOrderService: WorkOrderService,
    private orderService: OrderService,
    private pickService: PickService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.outbound.pick-confirm.title');
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('page.outbound.pick-confirm.title'));

    // check if we are confirming picks for
    // 1. outbound order
    // 2. pick list
    // 3. work order
    // For any single pick, it can be confirmed in the correpondent pages
    // 1. order display
    // 2. work order display
    // 3. pick list display
    // 4. replenishment display
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.type) {
        this.type = params.type;
      }
      if (params.number) {
        this.number = params.number;
      }
      this.displayInformation();
    });
  }

  displayInformation() {
    switch (this.type) {
      case 'workOrder':
        this.displayWorkOrder(this.number);
        break;
      case 'order':
        this.displayOrder(this.number);
        break;
      case 'pickList':
        this.displayPickList(this.number);
        break;
      default:
        break;
    }
  }
  displayWorkOrder(workOrderNumber: string) {
    // Let's get the work order by number
    this.workOrderService.getWorkOrders(workOrderNumber, null).subscribe(workOrdersRes => {
      // we query by work order number, which is a unique key. So we should only
      // get one work order(if the number is a valid number)
      if (workOrdersRes.length > 0) {
        this.workOrder = workOrdersRes[0];
        this.lastPageUrl = `/work-order/work-order?number=${workOrderNumber}`;
        // initial the picks array;
        this.listOfAllPicks = [];
        this.workOrder.workOrderLines.forEach(workOrderLine => {
          this.listOfAllPicks = [...this.listOfAllPicks, ...workOrderLine.picks];
          this.listOfDisplayPicks = [...this.listOfDisplayPicks, ...workOrderLine.picks];
          this.setupConfirmedQuantity(this.listOfAllPicks);
          this.refreshStatus();
        });
      }
    });
  }
  displayOrder(orderNumber: string) {
    // Let's get the work order by number
    this.orderService.getOrders(orderNumber).subscribe(ordersRes => {
      // we query by  order number, which is a unique key. So we should only
      // get one  order(if the number is a valid number)
      if (ordersRes.length > 0) {
        this.order = ordersRes[0];
        this.lastPageUrl = `/outbound/order?number=${orderNumber}`;
        // initial the picks array;
        this.pickService.getPicks(null, this.order.id).subscribe(pickRes => {
          this.listOfAllPicks = pickRes;
          this.listOfDisplayPicks = pickRes;
          this.setupConfirmedQuantity(this.listOfAllPicks);
          this.refreshStatus();
        });
      }
    });
  }
  displayPickList(pickListNumber: string) {}

  setupConfirmedQuantity(picks: PickWork[]) {
    picks.forEach(pick => {
      this.mapOfConfirmedQuantity[pick.number] = pick.quantity - pick.pickedQuantity;
    });
  }

  refreshStatus(): void {
    console.log(`Start to check all picks: ${JSON.stringify(this.mapOfCheckedId)}`);

    this.isAllDisplayDataChecked = this.listOfDisplayPicks.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayPicks.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;

    this.allPicksFullyConfirmed = this.listOfDisplayPicks.every(item => item.pickedQuantity >= item.quantity);
  }

  checkAll(value: boolean): void {
    this.listOfDisplayPicks.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayPicks = this.listOfAllPicks.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayPicks = this.listOfAllPicks;
    }
  }

  cancelSelectedPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.pickService.cancelPicks(selectedPicks).subscribe(res => {
            this.message.success(this.i18n.fanyi('message.pick.cancelled'));
            this.displayInformation();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
      });
    }
  }

  confirmPicks(): void {
    // make sure we have at least one checkbox checked
    const selectedPicks = this.getSelectedPicks();
    if (selectedPicks.length > 0) {
      this.confirming = true;
      this.totalPickCountToConfirm = selectedPicks.length;
      selectedPicks.forEach(pick => {
        this.pickService.confirmPick(pick, this.mapOfConfirmedQuantity[pick.number]).subscribe(pickRes => {
          this.message.success(this.i18n.fanyi('message.action.success'));
          this.displayInformation();
          this.totalPickCountToConfirm--;
          if (this.totalPickCountToConfirm === 0) {
            this.confirming = false;
          }
        });
      });
    }
  }
  getSelectedPicks(): PickWork[] {
    const selectedPicks: PickWork[] = [];
    this.listOfAllPicks.forEach((pick: PickWork) => {
      if (this.mapOfCheckedId[pick.id] === true && pick.quantity > pick.pickedQuantity) {
        selectedPicks.push(pick);
      }
    });
    return selectedPicks;
  }

  confirmPick(pick: PickWork) {
    this.confirming = true;
    this.pickService.confirmPick(pick, this.mapOfConfirmedQuantity[pick.number]).subscribe(pickRes => {
      this.message.success(this.i18n.fanyi('message.action.success'));
      this.displayInformation();
      this.confirming = false;
    });
  }
  returnToPreviousPage() {
    this.router.navigateByUrl(this.lastPageUrl);
  }
}
