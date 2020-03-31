import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { OrderService } from '../services/order.service';
import { Order } from '../models/order';
import { Customer } from '../../common/models/customer';
import { Router, ActivatedRoute } from '@angular/router';
import { PickWork } from '../models/pick-work';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';
import { ShortAllocation } from '../models/short-allocation';
import { Inventory } from '../../inventory/models/inventory';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';

@Component({
  selector: 'app-outbound-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less'],
})
export class OutboundOrderComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private orderService: OrderService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;
  unpickForm: FormGroup;
  searching = false;

  unpickedInventory: Inventory;

  // Table data for display
  listOfAllOrders: Order[] = [];
  listOfDisplayOrders: Order[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByShipToCustomer = [];
  filtersByBillToCustomer = [];
  // Save filters that already selected
  selectedFiltersByBillToCustomer: string[] = [];
  selectedFiltersByShipToCustomer: string[] = [];

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

  // list of record with printing in process
  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  shortAllocationStatus = ShortAllocationStatus;

  unpickModal: NzModalRef;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];
    this.filtersByShipToCustomer = [];
    this.filtersByBillToCustomer = [];
    this.selectedFiltersByBillToCustomer = [];
    this.selectedFiltersByShipToCustomer = [];
  }

  search(): void {
    this.searching = true;
    this.orderService.getOrders(this.searchForm.controls.number.value).subscribe(orderRes => {
      this.listOfAllOrders = this.calculateQuantities(orderRes);
      this.listOfDisplayOrders = this.calculateQuantities(orderRes);

      this.filtersByShipToCustomer = [];
      this.filtersByBillToCustomer = [];
      const existingShipToCustomer = new Set();
      const existingBillToCustomer = new Set();

      this.listOfAllOrders.forEach(order => {
        const shipToCustomerName = order.shipToCustomer
          ? order.shipToCustomer.name
          : `${order.shipToContactorFirstname} ${order.shipToContactorLastname}`;

        if (!existingShipToCustomer.has(shipToCustomerName)) {
          this.filtersByShipToCustomer.push({ text: shipToCustomerName, value: shipToCustomerName });
          existingShipToCustomer.add(shipToCustomerName);
        }
        const billToCustomerName = order.billToCustomer
          ? order.billToCustomer.name
          : `${order.billToContactorFirstname} ${order.billToContactorLastname}`;

        if (!existingBillToCustomer.has(billToCustomerName)) {
          this.filtersByBillToCustomer.push({ text: billToCustomerName, value: billToCustomerName });
          existingBillToCustomer.add(billToCustomerName);
        }
      });

      this.collapseAllRecord();
      this.searching = false;
    });
  }

  collapseAllRecord() {
    this.listOfDisplayOrders.forEach(item => (this.mapOfExpandedId[item.id] = false));
  }

  calculateQuantities(orders: Order[]): Order[] {
    orders.forEach(order => {
      const existingItemIds = new Set();
      order.totalLineCount = order.orderLines.length;
      order.totalItemCount = 0;
      order.totalExpectedQuantity = 0;
      order.totalOpenQuantity = 0;
      order.totalInprocessQuantity = 0;
      order.totalShippedQuantity = 0;

      order.orderLines.forEach(orderLine => {
        order.totalExpectedQuantity += orderLine.expectedQuantity;
        order.totalOpenQuantity += orderLine.openQuantity;
        order.totalInprocessQuantity += orderLine.inprocessQuantity;
        order.totalShippedQuantity += orderLine.shippedQuantity;
        if (!existingItemIds.has(orderLine.item.id)) {
          existingItemIds.add(orderLine.item.id);
        }
      });

      order.totalItemCount = existingItemIds.size;
    });
    return orders;
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayOrders.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayOrders.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayOrders.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByBillToCustomer: string[], selectedFiltersByShipToCustomer: string[]) {
    this.selectedFiltersByShipToCustomer = selectedFiltersByShipToCustomer;
    this.selectedFiltersByBillToCustomer = selectedFiltersByBillToCustomer;
    this.sortAndFilter();
  }

  sortAndFilter() {
    // filter data
    const filterFunc = (item: {
      shipToCustomer: Customer;
      billToCustomer: Customer;
      shipToContactorFirstname: string;
      shipToContactorLastname: string;
      billToContactorFirstname: string;
      billToContactorLastname: string;
    }) =>
      this.selectedFiltersByShipToCustomer.length
        ? this.selectedFiltersByShipToCustomer.some(shipToCustomerName => {
            if (item.shipToCustomer) {
              return item.shipToCustomer.name === shipToCustomerName;
            } else {
              return item.shipToContactorFirstname + ' ' + item.shipToContactorLastname === shipToCustomerName;
            }
          })
        : true && this.selectedFiltersByBillToCustomer.length
        ? this.selectedFiltersByBillToCustomer.some(billToCustomerName => {
            if (item.billToCustomer) {
              return item.billToCustomer.name === billToCustomerName;
            } else {
              return item.billToContactorFirstname + ' ' + item.billToContactorLastname === billToCustomerName;
            }
          })
        : true;

    const data = this.listOfAllOrders.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayOrders = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayOrders = data;
    }
  }

  cancelSelectedOrders(): void {
    // make sure we have at least one checkbox checked
    const selectedOrders = this.getSelectedOrders();
    if (selectedOrders.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.orderService.removeOrders(selectedOrders).subscribe(res => {
            console.log('selected order removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedOrders(): Order[] {
    const selectedOrders: Order[] = [];
    this.listOfAllOrders.forEach((order: Order) => {
      if (this.mapOfCheckedId[order.id] === true) {
        selectedOrders.push(order);
      }
    });
    return selectedOrders;
  }

  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.order'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });

    // IN case we get the number passed in, refresh the display
    // and show the order information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
  }

  allocateOrder(order: Order) {
    this.mapOfAllocationInProcessId[order.id] = true;
    this.orderService.allocateOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[order.id] = false;
      this.search();
    });
  }

  isOrderAllocatable(order: Order): boolean {
    return order.totalOpenQuantity > 0 || order.totalPendingAllocationQuantity > 0;
  }

  printPickSheets(order: Order) {
    this.mapOfPrintingInProcessId[order.id] = true;
    this.orderService.printOrderPickSheet(order);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[order.id] = false;
    }, 1000);
  }
  confirmPicks(order: Order) {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=order&number=${order.number}`);
  }
  showOrderDetails(order: Order) {
    console.log(`expanded: ${JSON.stringify(order)}`);
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[order.id] === true) {
      this.showPicks(order);
      this.showShortAllocations(order);
      this.showPickedInventory(order);
    }
  }
  showPicks(order: Order) {
    this.pickService.getPicks(null, order.id).subscribe(pickRes => {
      this.mapOfPicks[order.id] = [...pickRes];
      console.log(`Map of picks:\n${JSON.stringify(this.mapOfPicks)}`);
    });
  }
  showShortAllocations(order: Order) {
    this.shortAllocationService
      .getShortAllocations(order.number)
      .subscribe(shortAllocationRes => (this.mapOfShortAllocations[order.id] = [...shortAllocationRes]));
  }
  showPickedInventory(order: Order) {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicks(null, order.id).subscribe(pickRes => {
      this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
        console.log(`pickedInventoryRes:\n${JSON.stringify(pickedInventoryRes)}`);
        this.mapOfPickedInventory[order.id] = [...pickedInventoryRes];
      });
    });
  }

  stageOrder(order: Order) {
    this.orderService.stageOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  loadTrailer(order: Order) {
    this.orderService.loadTrailer(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  dispatchTrailer(order: Order) {
    this.orderService.dispatchTrailer(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  isReadyForStaging(order: Order): boolean {
    return true;
  }
  isReadyForLoading(order: Order): boolean {
    return true;
  }
  isReadyForDispatching(order: Order): boolean {
    return true;
  }

  cancelPick(order: Order, pick: PickWork) {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  openUnpickModal(inventory: Inventory, tplUnpickModalTitle: TemplateRef<{}>, tplUnpickModalContent: TemplateRef<{}>) {
    console.log(`start to unpick ${inventory}`);
    this.unpickForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location.name, disabled: true }),
      destinationLocation: [null],
      immediatelyPutaway: [null],
    });
    this.unpickedInventory = inventory;

    // Load the location
    this.unpickModal = this.modalService.create({
      nzTitle: tplUnpickModalTitle,
      nzContent: tplUnpickModalContent,
      nzOkText: this.i18n.fanyi('description.field.button.confirm'),
      nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.unpickModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.unpickInventory();
      },
      nzWidth: 1000,
    });
  }

  unpickInventory() {}

  cancelShortAllocation(shortAllocation: ShortAllocation) {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
}
