import { Component, OnInit, TemplateRef } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { I18NService } from '@core';
import { NzModalService, NzMessageService, NzModalRef } from 'ng-zorro-antd';

import { ShipmentService } from '../services/shipment.service';
import { Shipment } from '../models/shipment';
import { OrderLine } from '../models/order-line';
import { PickWork } from '../models/pick-work';
import { ShortAllocation } from '../models/short-allocation';
import { Inventory } from '../../inventory/models/inventory';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { Order } from '../models/order';
import { OrderService } from '../services/order.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { OrderLineService } from '../services/order-line.service';

@Component({
  selector: 'app-outbound-shipment',
  templateUrl: './shipment.component.html',
  styleUrls: ['./shipment.component.less'],
})
export class OutboundShipmentComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private shipmentService: ShipmentService,
    private orderService: OrderService,
    private orderLineService: OrderLineService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
  ) {}

  // Form related data and functions
  searchForm: FormGroup;
  unpickForm: FormGroup;
  searching = false;
  tabSelectedIndex = 0;

  // Table data for display
  listOfAllShipments: Shipment[] = [];
  listOfDisplayShipments: Shipment[] = [];
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

  // list of record with printing in process
  mapOfOrderLines: { [key: string]: OrderLine[] } = {};
  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  shortAllocationStatus = ShortAllocationStatus;

  unpickModal: NzModalRef;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllShipments = [];
    this.listOfDisplayShipments = [];
  }

  search(expandedShipmentId?: number, tabSelectedIndex?: number): void {
    this.searching = true;
    this.shipmentService.getShipments(this.searchForm.controls.number.value).subscribe(shipmentRes => {
      this.listOfAllShipments = this.calculateQuantities(shipmentRes);
      this.listOfDisplayShipments = this.calculateQuantities(shipmentRes);

      this.collapseAllRecord(expandedShipmentId);
      this.searching = false;
      if (tabSelectedIndex) {
        this.tabSelectedIndex = tabSelectedIndex;
      }
    });
  }

  calculateQuantities(shipments: Shipment[]): Shipment[] {
    shipments.forEach(shipment => {
      const existingItemIds = new Set();
      shipment.totalLineCount = shipment.shipmentLines.length;
      shipment.totalItemCount = 0;

      shipment.totalQuantity = 0;
      shipment.totalOpenQuantity = 0;
      shipment.totalInprocessQuantity = 0;
      shipment.totalLoadedQuantity = 0;
      shipment.totalShippedQuantity = 0;

      shipment.shipmentLines.forEach(shipmentLine => {
        shipment.totalQuantity += shipmentLine.quantity;
        shipment.totalOpenQuantity += shipmentLine.openQuantity;
        shipment.totalInprocessQuantity += shipmentLine.inprocessQuantity;
        shipment.totalLoadedQuantity += shipmentLine.loadedQuantity;
        shipment.totalShippedQuantity += shipmentLine.shippedQuantity;
        if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
          existingItemIds.add(shipmentLine.orderLine.itemId);
        }
      });

      shipment.totalItemCount = existingItemIds.size;
    });
    return shipments;
  }

  collapseAllRecord(expandedShipmentId?: number) {
    this.listOfDisplayShipments.forEach(item => (this.mapOfExpandedId[item.id] = false));
    if (expandedShipmentId) {
      this.mapOfExpandedId[expandedShipmentId] = true;
      this.listOfDisplayShipments.forEach(shipment => {
        if (shipment.id === expandedShipmentId) {
          this.showShipmentDetails(shipment);
        }
      });
    }
  }

  showShipmentDetails(shipment: Shipment) {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.mapOfExpandedId[shipment.id] === true) {
      this.showOrderLines(shipment);
      this.showPicks(shipment);
      this.showShortAllocations(shipment);
      this.showPickedInventory(shipment);
    }
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayShipments.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayShipments.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayShipments.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayShipments = this.listOfAllShipments.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayShipments = this.listOfAllShipments;
    }
  }

  cancelSelectedShipments(): void {
    // make sure we have at least one checkbox checked
    const selectedShipments = this.getSelectedShipments();
    if (selectedShipments.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.shipmentService.cancelShipments(selectedShipments).subscribe(res => {
            console.log('selected shipment cancelled');
            this.messageService.success(this.i18n.fanyi('message.shipment.cancelled'));
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedShipments(): Shipment[] {
    const selectedShipments: Shipment[] = [];
    this.listOfAllShipments.forEach((shipment: Shipment) => {
      if (this.mapOfCheckedId[shipment.id] === true) {
        selectedShipments.push(shipment);
      }
    });
    return selectedShipments;
  }

  completeShipment(shipment: Shipment) {
    this.shipmentService.completeShipment(shipment).subscribe(res => {
      console.log('shipment complete');
      this.messageService.success(this.i18n.fanyi('message.shipment.complete'));
      this.search();
    });
  }
  ngOnInit() {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.shipment'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });
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
  confirmPicks(shipment: Shipment) {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=shipment&id=${shipment.id}`);
  }

  showOrderLines(shipment: Shipment) {
    this.orderLineService.getOrderLinesByShipment(shipment.id).subscribe(orderLineRes => {
      this.mapOfOrderLines[shipment.id] = [...orderLineRes];
    });
  }
  showPicks(shipment: Shipment) {
    this.pickService.getPicksByShipment(shipment.id).subscribe(pickRes => {
      this.mapOfPicks[shipment.id] = [...pickRes];
    });
  }
  showShortAllocations(shipment: Shipment) {
    this.shortAllocationService.getShortAllocationsByShipment(shipment.id).subscribe(shortAllocationRes => {
      console.log(`shortAllocationRes.length: ${shortAllocationRes.length}`);
      this.mapOfShortAllocations[shipment.id] = shortAllocationRes.length === 0 ? [] : [...shortAllocationRes];
    });
  }
  showPickedInventory(shipment: Shipment) {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByShipment(shipment.id).subscribe(pickRes => {
      console.log(`pickRes.length: ${pickRes.length}`);
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[shipment.id] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          console.log(`pickedInventoryRes.length: ${pickedInventoryRes.length}`);
          this.mapOfPickedInventory[shipment.id] = pickedInventoryRes.length === 0 ? [] : [...pickedInventoryRes];
        });
      }
    });
  }

  stageShipment(shipment: Shipment) {}

  loadTrailer(shipment: Shipment) {}

  dispatchTrailer(shipment: Shipment) {}

  isReadyForStaging(order: Order): boolean {
    return true;
  }
  isReadyForLoading(order: Order): boolean {
    return true;
  }
  isReadyForDispatching(order: Order): boolean {
    return true;
  }

  cancelPick(shipment: Shipment, pick: PickWork) {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 1);
    });
  }
  openUnpickModal(
    shipment: Shipment,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ) {
    this.unpickForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location.name, disabled: true }),
      destinationLocation: [null],
      immediateMove: [null],
    });

    // Load the location
    this.unpickModal = this.modalService.create({
      nzTitle: tplUnpickModalTitle,
      nzContent: tplUnpickModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.unpickModal.destroy();
        // this.refreshReceiptResults();
      },
      nzOnOk: () => {
        this.unpickInventory(
          shipment,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(shipment: Shipment, inventory: Inventory, destinationLocation: string, immediateMove: boolean) {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 2);
    });
  }

  cancelShortAllocation(shipment: Shipment, shortAllocation: ShortAllocation) {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 3);
    });
  }

  allocateShipment(shipment: Shipment) {
    this.mapOfAllocationInProcessId[shipment.id] = true;
    this.shipmentService.allocateShipment(shipment).subscribe(shipmentRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[shipment.id] = false;
      this.search();
    });
  }

  isShipmentAllocatable(shipment: Shipment): boolean {
    return shipment.totalOpenQuantity > 0;
  }
}
