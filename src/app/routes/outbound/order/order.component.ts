import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Customer } from '../../common/models/customer';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { Printer } from '../../common/models/printer';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryService } from '../../inventory/services/inventory.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { Order } from '../models/order';
import { OrderStatus } from '../models/order-status.enum';
import { PickWork } from '../models/pick-work';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { OrderService } from '../services/order.service';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';


@Component({
  selector: 'app-outbound-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less'],
})
export class OutboundOrderComponent implements OnInit {

  listOfColumns: ColumnItem[] = [
    {
      name: 'order.number',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    },{
      name: 'order.category',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableString(a.number, b.number),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    },  {
      name: 'status',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableString(a.status.toString(), b.status.toString()),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'shipToCustomer',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.shipToCustomer, b.shipToCustomer, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'order.billToCustomer',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.billToCustomer, b.billToCustomer, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'order.totalItemCount',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalItemCount, b.totalItemCount),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'order.totalOrderQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalExpectedQuantity, b.totalExpectedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'order.totalOpenQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalOpenQuantity, b.totalOpenQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'shipment.stage.locationGroup',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.stageLocationGroup, b.stageLocationGroup, "name"),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'shipment.stage.location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableObjField(a.stageLocation, b.stageLocation, "name"),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    }, {
      name: 'order.totalInprocessQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalInprocessQuantity, b.totalInprocessQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 1,
      colspan: 3,
    }, {
      name: 'order.totalShippedQuantity',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Order, b: Order) => this.utilService.compareNullableNumber(a.totalShippedQuantity, b.totalShippedQuantity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,
      rowspan: 2,
      colspan: 1,
    },

  ];
  expandSet = new Set<number>();
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

  
  orderReassignShippingStageLocationModal!: NzModalRef;
  orderReassignShippingStageLocationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private orderService: OrderService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryService: InventoryService,
    private utilService: UtilService,
    private printingService: PrintingService,
    private locationGroupTypeService: LocationGroupTypeService, 
    private locationGroupService: LocationGroupService, 
    private locationService: LocationService
  ) { }

  printerModal!: NzModalRef;
  printerForm!: FormGroup;
  availablePrinters: Printer[] = [];

  // Form related data and functions
  searchForm!: FormGroup;
  unpickForm!: FormGroup;

  searching = false;
  searchResult = '';

  tabSelectedIndex = 0;
  // Table data for display
  listOfAllOrders: Order[] = [];
  listOfDisplayOrders: Order[] = [];

  // list of record with allocation in process
  mapOfAllocationInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPrintingInProcessId: { [key: string]: boolean } = {};

  // list of record with printing in process
  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  shortAllocationStatus = ShortAllocationStatus;

  unpickModal!: NzModalRef;

  orderStatusEnum = OrderStatus;

  isSpinning = false;

  
  avaiableLocationGroups: LocationGroup[] = [];

  avaiableLocations: WarehouseLocation[] = [];

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];

  }

  search(expandedOrderId?: number, tabSelectedIndex?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.orderService.getOrders(this.searchForm.controls.number.value).subscribe(
      orderRes => {
        this.listOfAllOrders = this.calculateQuantities(orderRes);
        this.listOfDisplayOrders = this.calculateQuantities(orderRes);


        this.listOfAllOrders.forEach(order => {
          // reset the allocation in process flag
          this.mapOfAllocationInProcessId[order.id!] = false;

        });

        this.collapseAllRecord(expandedOrderId);

        this.isSpinning = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: orderRes.length,
        });

        if (tabSelectedIndex) {
          this.tabSelectedIndex = tabSelectedIndex;
        }
      },
      () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    );
  }

  collapseAllRecord(expandedOrderId?: number): void {
    this.listOfDisplayOrders.forEach(item => this.expandSet.delete(item.id!));
    if (expandedOrderId) {
      this.expandSet.add(expandedOrderId);
      this.listOfDisplayOrders.forEach(order => {
        if (order.id === expandedOrderId) {
          this.showOrderDetails(order);
        }
      });
    }
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
        order.totalExpectedQuantity! += orderLine.expectedQuantity;
        order.totalOpenQuantity! += orderLine.openQuantity;
        order.totalInprocessQuantity! += orderLine.inprocessQuantity;
        order.totalShippedQuantity! += orderLine.shippedQuantity;
        if (!existingItemIds.has(orderLine.itemId)) {
          existingItemIds.add(orderLine.itemId);
        }
      });

      order.totalItemCount = existingItemIds.size;
    });
    return orders;
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
    this.listOfDisplayOrders!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Order[]): void {
    this.listOfDisplayOrders! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayOrders!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayOrders!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
    this.showAllOrderDetails();
  }


  cancelSelectedOrders(): void {
    // make sure we have at least one checkbox checked
    const selectedOrders = this.getSelectedOrders();
    if (selectedOrders.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.location-group.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.location-group.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.orderService.removeOrders(selectedOrders).subscribe(res => {
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedOrders(): Order[] {
    const selectedOrders: Order[] = [];
    this.listOfAllOrders.forEach((order: Order) => {
      if (this.setOfCheckedId.has(order.id!)) {
        selectedOrders.push(order);
      }
    });
    return selectedOrders;
  }

  ngOnInit(): void {
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

  allocateOrder(order: Order): void {
    this.isSpinning = true;
    this.orderService.allocateOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.isSpinning = false;
      this.search();
    }, 
    () =>  this.isSpinning = false);
  }

  completeOrder(order: Order): void {
    this.isSpinning = true;
    this.orderService.completeOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.isSpinning = false;
      this.search();
    }, 
    () =>  this.isSpinning = false);
  }
  isOrderAllocatable(order: Order): boolean {
    return order.totalOpenQuantity! > 0 || order.totalPendingAllocationQuantity! > 0;
  }
  isOrderReadyForComplete(order: Order): boolean {
    return order.status === OrderStatus.OPEN;
  }

  confirmPicks(order: Order): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=order&id=${order.id}`);
  }
  showOrderDetails(order: Order): void {
    // When we expand the details for the order, load the picks and short allocation from the server
    // if (this.expandSet.has(order.id!)) {
      this.showPicks(order);
      this.showShortAllocations(order);
      this.showPickedInventory(order);
    // }
  }

  showAllOrderDetails(): void {

    this.listOfDisplayOrders.forEach(order => {
      if (this.expandSet.has(order.id!)) {
        this.showPicks(order);
        this.showShortAllocations(order);
        this.showPickedInventory(order);
      }
    });
  }
  showPicks(order: Order): void {
    this.pickService.getPicksByOrder(order.id!).subscribe(pickRes => {
      this.mapOfPicks[order.id!] = [...pickRes];
    });
  }
  showShortAllocations(order: Order): void {
    this.shortAllocationService
      .getShortAllocationsByOrder(order.id!)
      .subscribe(shortAllocationRes => (this.mapOfShortAllocations[order.id!] = [...shortAllocationRes]));
  }
  showPickedInventory(order: Order): void {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByOrder(order.id!).subscribe(pickRes => {
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[order.id!] = [];
      } else {
        this.pickService.getPickedInventories(pickRes).subscribe(pickedInventoryRes => {
          this.mapOfPickedInventory[order.id!] = [...pickedInventoryRes];
        });
      }
    });
  }

  stageOrder(order: Order): void {
    this.orderService.stageOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  loadTrailer(order: Order): void {
    this.orderService.loadTrailer(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

  dispatchTrailer(order: Order): void {
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

  cancelPick(order: Order, pick: PickWork): void {
    this.pickService.cancelPick(pick).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(order.id, 1);
    });
  }
  openUnpickModal(
    order: Order,
    inventory: Inventory,
    tplUnpickModalTitle: TemplateRef<{}>,
    tplUnpickModalContent: TemplateRef<{}>,
  ): void {
    this.unpickForm = this.fb.group({
      lpn: new FormControl({ value: inventory.lpn, disabled: true }),
      itemNumber: new FormControl({ value: inventory.item!.name, disabled: true }),
      itemDescription: new FormControl({ value: inventory.item!.description, disabled: true }),
      inventoryStatus: new FormControl({ value: inventory.inventoryStatus!.name, disabled: true }),
      itemPackageType: new FormControl({ value: inventory.itemPackageType!.name, disabled: true }),
      quantity: new FormControl({ value: inventory.quantity, disabled: true }),
      locationName: new FormControl({ value: inventory.location!.name, disabled: true }),
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
          order,
          inventory,
          this.unpickForm.controls.destinationLocation.value,
          this.unpickForm.controls.immediateMove.value,
        );
      },
      nzWidth: 1000,
    });
  }

  unpickInventory(order: Order, inventory: Inventory, destinationLocation: string, immediateMove: boolean): void {
    console.log(
      `Start to unpick ${JSON.stringify(inventory)} to ${destinationLocation}, immediateMove: ${immediateMove}`,
    );
    this.inventoryService.unpick(inventory, destinationLocation, immediateMove).subscribe(res => {
      console.log(`unpick is done`);
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the picked inventory
      this.search(order.id, 2);
    });
  }

  cancelShortAllocation(order: Order, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      // refresh the short allocation
      this.search(order.id, 3);
    });
  }

  isShortAllocationAllocatable(shortAllocation: ShortAllocation): boolean {
    return shortAllocation.openQuantity > 0;
  }
  allocateShortAllocation(order: Order, shortAllocation: ShortAllocation): void {
    this.shortAllocationService.allocateShortAllocation(shortAllocation).subscribe(shortAllocationRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search(order.id, 3);
    });
  }

  printPickSheets(order: Order, event: any): void {
    this.isSpinning = true;
    console.log(`start to print ${order.number} from ${JSON.stringify(event)}`);

    this.orderService
      .printOrderPickSheet(order, this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printRemoteFileByName(
          "order pick sheet",
          printResult.fileName,
          ReportType.ORDER_PICK_SHEET,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      });

  }
  previewReport(order: Order): void {
    this.isSpinning = true;
    console.log(`start to preview ${order.number}`);
    this.orderService.printOrderPickSheet(order, this.i18n.currentLang).subscribe(printResult => {
      // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
      this.isSpinning = false;
      this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

    });
  }
 
  
  stageLocationGroupChange(): void {
    console.log( `location group id is changed to ${this.orderReassignShippingStageLocationForm.controls.stageLocationGroupId.value}`) ;

    let locationGroupIds = this.avaiableLocationGroups.filter(
      locationGroup => locationGroup.id === +this.orderReassignShippingStageLocationForm.controls.stageLocationGroupId.value
    ).map(locationGroup => locationGroup.id).join(",");
    this.locationService.getLocations(undefined, locationGroupIds, undefined, true).subscribe(
      {
        next: (locationRes) => this.avaiableLocations = locationRes
      }
    )
} 
  
  openReassignStageLocationModel(
    order: Order,
    tplOrderReassignShippingStageLocationModalTitle: TemplateRef<{}>,
    tplOrderReassignShippingStageLocationModalContent: TemplateRef<{}>,
  ): void { 
    this.loadShippingStageLocationGroups();
    this.orderReassignShippingStageLocationForm = this.fb.group({
      currentStageLocationGroup: new FormControl({ value: order.stageLocationGroup?.description, disabled: true}),
      currentStageLocation: new FormControl({ value:  order.stageLocation?.name, disabled: true}),
      stageLocationGroupId: new FormControl({ value: order.stageLocationGroupId }),
      stageLocationId: new FormControl({ value:  order.stageLocationGroupId }),
    });

    // Load the location
    this.orderReassignShippingStageLocationModal = this.modalService.create({
      nzTitle: tplOrderReassignShippingStageLocationModalTitle,
      nzContent: tplOrderReassignShippingStageLocationModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.orderReassignShippingStageLocationModal.destroy();
        
      },
      nzOnOk: () => {
        this.isSpinning = true;
        this.orderService.reassignShippingStageLocation(
          order,
          this.orderReassignShippingStageLocationForm.controls.stageLocationGroupId.value,
          this.orderReassignShippingStageLocationForm.controls.stageLocationId.value,
        ).subscribe({
          next: (orderRes) => {
            
            this.messageService.success(this.i18n.fanyi('message.action.success')); 
            this.search();
            this.isSpinning = false;
          }, 
          error: () => {this.isSpinning = false}
        });
      },

      nzWidth: 1000,
    });
  }

  
  loadShippingStageLocationGroups(): void {

    this.locationGroupTypeService.loadLocationGroupTypes(true).subscribe(
      {
        next: (shippingStageTypesRes) => {
          let locationGroupTypes: number[] = [];
          shippingStageTypesRes.forEach(shippingStageType => {
            locationGroupTypes.push(shippingStageType.id);
          })
          this.locationGroupService.getLocationGroups(locationGroupTypes, []).subscribe(
            {
              next: (locationGroupsRes) => {
                this.avaiableLocationGroups = locationGroupsRes;
              }
            }
          )
        } , 
        
      }
    )
  } 


  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("order.number"), index: 'number', iif: () => this.isChoose('number'), },
    { title: this.i18n.fanyi("order.category"), 
      index: 'category', 
      format: (item, _col, index) => this.i18n.fanyi(`ORDER-CATEGORY-${ item.category}` ), 
      
      iif: () => this.isChoose('category'), },
    { title: this.i18n.fanyi("status"), index: 'status', iif: () => this.isChoose('status'), },    
    {
      title: this.i18n.fanyi("shipToCustomer"),
      // renderTitle: 'customTitle',
      render: 'shipToCustomerColumn',
      iif: () => this.isChoose('shipToCustomer'),
    },
    { title: this.i18n.fanyi("order.billToCustomer"), index: 'billToCustomer?.name', iif: () => this.isChoose('billToCustomer'), },
    { title: this.i18n.fanyi("order.totalItemCount"), index: 'totalItemCount', iif: () => this.isChoose('totalItemCount'), },
    { title: this.i18n.fanyi("order.totalOrderQuantity"), index: 'totalExpectedQuantity', iif: () => this.isChoose('totalExpectedQuantity'), },
    { title: this.i18n.fanyi("order.totalOpenQuantity"), index: 'totalOpenQuantity', iif: () => this.isChoose('totalOpenQuantity'), },
    { title: this.i18n.fanyi("shipment.stage.locationGroup"), index: 'stageLocationGroup.description', iif: () => this.isChoose('stageLocationGroup'), },
    { title: this.i18n.fanyi("shipment.stage.location"), index: 'stageLocation.name', iif: () => this.isChoose('stageLocation'), },    
    { title: this.i18n.fanyi("order.totalInprocessQuantity"), index: 'totalInprocessQuantity', iif: () => this.isChoose('totalInprocessQuantity'), },
    {
      title: this.i18n.fanyi('order.totalInprocessQuantity'),
      iif: () => this.isChoose('totalInprocessQuantity'),
      children: [
        { title: this.i18n.fanyi("order.totalPendingAllocationQuantity"), index: 'totalPendingAllocationQuantity', iif: () => this.isChoose('totalPendingAllocationQuantity'), }, 
        { title: this.i18n.fanyi("order.totalOpenPickQuantity"), index: 'totalOpenPickQuantity', iif: () => this.isChoose('totalOpenPickQuantity'), }, 
        { title: this.i18n.fanyi("order.totalPickedQuantity"), index: 'totalPickedQuantity', iif: () => this.isChoose('totalPickedQuantity'), },    
      ],
    },
    { title: this.i18n.fanyi("order.totalShippedQuantity"), index: 'totalShippedQuantity', iif: () => this.isChoose('totalShippedQuantity'), },
    { title: this.i18n.fanyi("action"), index: 'totalShippedQuantity', iif: () => this.isChoose('totalShippedQuantity'), },
    
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',
      render: 'actionColumn',
    },
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("order.number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("order.category"), value: 'category', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("shipToCustomer"), value: 'shipToCustomer', checked: true },
    { label: this.i18n.fanyi("order.billToCustomer"), value: 'billToCustomer', checked: true },
    { label: this.i18n.fanyi("order.totalItemCount"), value: 'totalItemCount', checked: true },
    { label: this.i18n.fanyi("order.totalOrderQuantity"), value: 'totalExpectedQuantity', checked: true },
    { label: this.i18n.fanyi("order.totalOpenQuantity"), value: 'totalOpenQuantity', checked: true },
    { label: this.i18n.fanyi("shipment.stage.locationGroup"), value: 'stageLocationGroup', checked: true },
    { label: this.i18n.fanyi("shipment.stage.location"), value: 'stageLocation', checked: true },
    { label: this.i18n.fanyi("order.totalInprocessQuantity"), value: 'totalInprocessQuantity', checked: true },
    { label: this.i18n.fanyi("order.totalPendingAllocationQuantity"), value: 'totalPendingAllocationQuantity', checked: true },
    { label: this.i18n.fanyi("order.totalOpenPickQuantity"), value: 'totalOpenPickQuantity', checked: true },
    { label: this.i18n.fanyi("order.totalPickedQuantity"), value: 'totalPickedQuantity', checked: true },
    { label: this.i18n.fanyi("order.totalShippedQuantity"), value: 'totalShippedQuantity', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  orderTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showOrderDetails(event.expand);
    }

  }
}
