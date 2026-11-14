import { formatDate } from '@angular/common';
import { Component, inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { OrderLine } from '../models/order-line';
import { PickWork } from '../models/pick-work';
import { Shipment } from '../models/shipment';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { OrderLineService } from '../services/order-line.service'; 
import { PickService } from '../services/pick.service';
import { ShipmentService } from '../services/shipment.service';
import { ShortAllocationService } from '../services/short-allocation.service';

@Component({
    selector: 'app-outbound-shipment',
    templateUrl: './shipment.component.html',
    styleUrls: ['./shipment.component.less'],
    standalone: false
})
export class OutboundShipmentComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;

  listOfColumns: Array<ColumnItem<Shipment>> = [
    {
      name: 'shipment.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableString(a.status.toString(), b.status.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'carrier',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableObjField(a.carrier, b.carrier, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'carrier.serviceLevel',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableObjField(a.carrierServiceLevel, b.carrierServiceLevel, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalLineCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalLineCount, b.totalLineCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalQuantity, b.totalQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalOpenQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalOpenQuantity, b.totalOpenQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalInprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalInprocessQuantity, b.totalInprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalLoadedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalLoadedQuantity, b.totalLoadedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'shipment.totalShippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Shipment, b: Shipment) => this.utilService.compareNullableNumber(a.totalShippedQuantity, b.totalShippedQuantity),
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
    private shipmentService: ShipmentService, 
    private orderLineService: OrderLineService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private utilService: UtilService,
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/shipment").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                              
  }

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  unpickForm!: UntypedFormGroup;
  searching = false;
  searchResult = '';
  tabSelectedIndex = 0;

  // Table data for display
  listOfAllShipments: Shipment[] = [];
  listOfDisplayShipments: Shipment[] = [];


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

  unpickModal!: NzModalRef;

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllShipments = [];
    this.listOfDisplayShipments = [];
  }

  search(expandedShipmentId?: number, tabSelectedIndex?: number): void {
    this.searching = true;
    this.isSpinning = true;
    this.searchResult = '';

    this.shipmentService.getShipments(this.searchForm.value.number, 
      this.searchForm.value.orderNumber).subscribe(
      shipmentRes => {
        this.listOfAllShipments = this.calculateQuantities(shipmentRes);
        this.listOfDisplayShipments = this.calculateQuantities(shipmentRes);

        this.collapseAllRecord(expandedShipmentId);
        this.searching = false;
        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: shipmentRes.length,
        });
        if (tabSelectedIndex) {
          this.tabSelectedIndex = tabSelectedIndex;
        }
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
  }
  canCancelShipment(shipment: Shipment) {
    return true;
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
        shipment.totalQuantity! += shipmentLine.quantity;
        shipment.totalOpenQuantity! += shipmentLine.openQuantity;
        shipment.totalInprocessQuantity! += shipmentLine.inprocessQuantity;
        shipment.totalLoadedQuantity! += shipmentLine.loadedQuantity;
        shipment.totalShippedQuantity! += shipmentLine.shippedQuantity;
        if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
          existingItemIds.add(shipmentLine.orderLine.itemId);
        }
      });

      shipment.totalItemCount = existingItemIds.size;
    });
    return shipments;
  }

  collapseAllRecord(expandedShipmentId?: number): void {
    this.listOfDisplayShipments.forEach(item => (this.expandSet.delete(item.id)));
    if (expandedShipmentId) {
      this.expandSet.add(expandedShipmentId);
      this.listOfDisplayShipments.forEach(shipment => {
        if (shipment.id === expandedShipmentId) {
          this.showShipmentDetails(shipment);
        }
      });
    }
  }

  showShipmentDetails(shipment: Shipment): void {
    // When we expand the details for the order, load the picks and short allocation from the server
    if (this.expandSet.has(shipment.id)) {
      this.showOrderLines(shipment);
      this.showPicks(shipment);
      this.showShortAllocations(shipment);
      this.showPickedInventory(shipment);
    }
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
    this.listOfDisplayShipments!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Shipment[]): void {
    this.listOfDisplayShipments! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayShipments!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayShipments!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }

  onExpandChange(shipment: Shipment, checked: boolean): void {
    if (checked) {
      this.expandSet.add(shipment.id);
    } else {
      this.expandSet.delete(shipment.id);
    }
    this.showShipmentDetails(shipment);
  }


  cancelSelectedShipments(): void {
    // make sure we have at least one checkbox checked
    const selectedShipments = this.getSelectedShipments();
    if (selectedShipments.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
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
  cancelShipment(shipment: Shipment) : void {
    this.isSpinning = true;
    this.shipmentService.cancelShipment(shipment).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.shipment.cancelled'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    })

  }

  getSelectedShipments(): Shipment[] {
    const selectedShipments: Shipment[] = [];
    this.listOfAllShipments.forEach((shipment: Shipment) => {
      if (this.setOfCheckedId.has(shipment.id)) {
        selectedShipments.push(shipment);
      }
    });
    return selectedShipments;
  }

  completeShipment(shipment: Shipment): void {
    this.shipmentService.completeShipment(shipment).subscribe(res => {
      console.log('shipment complete');
      this.messageService.success(this.i18n.fanyi('message.shipment.complete'));
      this.search();
    });
  }
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.shipment'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderNumber: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
        this.search();
      }
    });
  }

  printPickSheets(shipment: Shipment): void {
    this.mapOfPrintingInProcessId[shipment.id] = true;
    // this.orderService.printOrderPickSheet(shipment);
    // purposely to show the 'loading' status of the print button
    // for at least 1 second. The above printWorkOrderPickSheet will
    // return immediately but the print job(or print preview page)
    // will start with some delay. During the delay, we will
    // display the 'print' button as 'Loading' status
    setTimeout(() => {
      this.mapOfPrintingInProcessId[shipment.id] = false;
    }, 1000);
  }
  confirmPicks(shipment: Shipment): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=shipment&id=${shipment.id}`);
  }

  showOrderLines(shipment: Shipment): void {
    this.orderLineService.getOrderLinesByShipment(shipment.id).subscribe(orderLineRes => {
      this.mapOfOrderLines[shipment.id] = [...orderLineRes];
    });
  }
  showPicks(shipment: Shipment): void {
    this.pickService.getPicksByShipment(shipment.id).subscribe(pickRes => {
      this.mapOfPicks[shipment.id] = [...pickRes];
    });
  }
  showShortAllocations(shipment: Shipment): void {
    this.shortAllocationService.getShortAllocationsByShipment(shipment.id).subscribe(shortAllocationRes => {
      console.log(`shortAllocationRes.length: ${shortAllocationRes.length}`);
      this.mapOfShortAllocations[shipment.id] = shortAllocationRes.length === 0 ? [] : [...shortAllocationRes];
    });
  }
  showPickedInventory(shipment: Shipment): void {
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

  stageShipment(shipment: Shipment): void { }

  loadTrailer(shipment: Shipment): void { }

  dispatchTrailer(shipment: Shipment): void { }

  isReadyForStaging(shipment: Shipment): boolean {
    return true;
  }
  isReadyForLoading(shipment: Shipment): boolean {
    return true;
  }
  isReadyForDispatching(shipment: Shipment): boolean {
    return true;
  }

  cancelPick(shipment: Shipment, pick: PickWork, 
    errorLocation: boolean, generateCycleCount: boolean): void {
    this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe(pickRes => {
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
  ): void {
    this.unpickForm = this.fb.group({
      lpn: new UntypedFormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new UntypedFormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new UntypedFormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new UntypedFormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new UntypedFormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new UntypedFormControl({ value: inventory.quantity, disabled: true }),
      locationName: new UntypedFormControl({ value: inventory.locationName, disabled: true }),
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
          this.unpickForm.value.destinationLocation,
          this.unpickForm.value.immediateMove,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(shipment: Shipment, inventory: Inventory, destinationLocation: string, immediateMove: boolean): void {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 2);
    });
  }

  cancelShortAllocation(shipment: Shipment, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(shipment.id, 3);
    });
  }

  allocateShipment(shipment: Shipment): void {
    this.mapOfAllocationInProcessId[shipment.id] = true;
    this.shipmentService.allocateShipment(shipment).subscribe(shipmentRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.mapOfAllocationInProcessId[shipment.id] = false;
      this.search();
    });
  }

  isShipmentAllocatable(shipment: Shipment): boolean {
    return shipment.totalOpenQuantity! > 0;
  }
}
