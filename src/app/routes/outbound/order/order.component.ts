import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
 
import { UserService } from '../../auth/services/user.service';
import { BillableActivityType } from '../../billing/models/billable-activity-type';
import { BillableActivityTypeService } from '../../billing/services/billable-activity-type.service';
import { Client } from '../../common/models/client';
import { Customer } from '../../common/models/customer';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum'; 
import { ClientService } from '../../common/services/client.service';
import { CustomerService } from '../../common/services/customer.service';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ItemUnitOfMeasure } from '../../inventory/models/item-unit-of-measure';
import { InventoryService } from '../../inventory/services/inventory.service';
import { Printer } from '../../report/models/printer';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum'; 
import { EasyPostConfigurationService } from '../../transportation/services/easy-post-configuration.service';
import { LocalCacheService } from '../../util/services/local-cache.service'; 
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { BillOfMaterial } from '../../work-order/models/bill-of-material';
import { BillOfMaterialService } from '../../work-order/services/bill-of-material.service';
import { Order } from '../models/order';
import { OrderBillableActivity } from '../models/order-billable-activity';
import { OrderCancellationRequestResult } from '../models/order-cancellation-request-result.enum';
import { OrderCategory } from '../models/order-category';
import { OrderDocument } from '../models/order-document';
import { OrderLine } from '../models/order-line';
import { OrderLineBillableActivity } from '../models/order-line-billable-activity';
import { OrderStatus } from '../models/order-status.enum';
import { ParcelPackage } from '../models/parcel-package';
import { PickWork } from '../models/pick-work';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { OrderDocumentService } from '../services/order-document.service';
import { OrderLineService } from '../services/order-line.service';
import { OrderService } from '../services/order.service';
import { ParcelPackageService } from '../services/parcel-package.service';
import { PickService } from '../services/pick.service';
import { ShipmentLineService } from '../services/shipment-line.service';
import { ShortAllocationService } from '../services/short-allocation.service';


@Component({
  selector: 'app-outbound-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.less'],
})
export class OutboundOrderComponent implements OnInit {
 
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  
 
  orderReassignShippingStageLocationModal!: NzModalRef;
  orderReassignShippingStageLocationForm!: UntypedFormGroup;

  orderStatuses = OrderStatus;
  orderCategories = OrderCategory;

  availableBOM: BillOfMaterial[] = [];

  createWorkOrderModal!: NzModalRef;
  createWorkOrderForm!: UntypedFormGroup;

  validCustomers: Customer[] = [];
  
  // show the BOM details when the user choose
  // a bom to create work order for short allocation
  displayBom: BillOfMaterial | undefined;

  displayOnly = false;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([
    ['add-order', false],
    ['file-upload', false],
    ['modify-order', false],
    ['allocate-order', false],
    ['reassign-stage-location', false],
    ['complete-order', false],
    ['remove-order', false],
    ['retrigger-order-confirm-integration', false],
    ['upload-document', false],
    ['ship-parcel', false],
    ['ship-by-hualei', false],    
    ['add-order-billable-activity-type', false],
    ['add-order-line-billable-activity-type', false],
    ['cancel-single-pick', false],
    ['cancel-multiple-pick', false],
    ['confirm-multiple-pick', false],
    ['unpick', false],
    ['allocate-short-allocation', false],
    ['create-work-order', false],
    ['cancel-short-allocation', false],
    ['remove-order-billable-activity-type', false],
    ['remove-order-document', false],
    ['remove-order-line-billable-activity-type', false],
    ['cancel-order', false],
    ['clear-cancellation-request', false], 
    ['walmart-shipping-carton-label', false], 
  ]);

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private orderService: OrderService,
    private messageService: NzMessageService,
    private router: Router,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService,
    private parcelPackageService: ParcelPackageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private inventoryService: InventoryService, 
    private printingService: PrintingService,
    private locationGroupTypeService: LocationGroupTypeService, 
    private locationGroupService: LocationGroupService, 
    private locationService: LocationService,
    private localCacheService: LocalCacheService,
    private shipmentLineService: ShipmentLineService,
    private billOfMaterialService: BillOfMaterialService,
    private orderDocumentService: OrderDocumentService,
    private easyPostConfigurationService: EasyPostConfigurationService,
    private customerService: CustomerService,
    private clientService: ClientService,
    private userService: UserService,
    private billableActivityTypeService: BillableActivityTypeService,
    private orderLineService: OrderLineService,
    private warehouseService: WarehouseService,
  ) {  
    userService.isCurrentPageDisplayOnly("/outbound/order").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );
    userService.getUserPermissionByWebPage("/outbound/order").subscribe({
      next: (userPermissionRes) => {
        userPermissionRes.forEach(
          userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
        )
      }
    });
  
  }
  

  printerModal!: NzModalRef;
  printerForm!: UntypedFormGroup;
  availablePrinters: Printer[] = [];

  // Form related data and functions
  searchForm!: UntypedFormGroup;
  unpickForm!: UntypedFormGroup;

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
  
  mapOfParcelPackages: { [key: string]: ParcelPackage[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};

  shortAllocationStatus = ShortAllocationStatus;

  unpickModal!: NzModalRef;

  orderStatusEnum = OrderStatus;

  isSpinning = false;
  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];

  
  avaiableLocationGroups: LocationGroup[] = [];

  avaiableLocations: WarehouseLocation[] = [];

  loadingOrderDetailsRequest = 0;

  
  billableActivityOrder?: Order;
  billableActivityOrderLine?: OrderLine; 
  billableActivityTypes: BillableActivityType[] = []; 

  billableActivityModal!: NzModalRef; 
  billableActivityForm!: UntypedFormGroup;
  addActivityInProcess = false;

  
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.order'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderStatus: [null],
      customer: [null],
      completeTimeRanger: [null],
      completeDate: [null],
      orderCategory: [null],
      createdTimeRanger: [null],
      createdDate: [null],
      client: [null],
    });

    // IN case we get the number passed in, refresh the display
    // and show the order information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => this.validCustomers = customerRes
    })

    
    this.initClientAssignment();
    
    this.billableActivityTypeService.loadBillableActivityTypes(true).subscribe({
      next: (billableActivityTypeRes) => this.billableActivityTypes = billableActivityTypeRes
    });
  }

  initClientAssignment(): void {
    
    this.isSpinning = true;
    
    // initiate the select control
    this.clientService.getClients().subscribe({
      next: (clientRes) => this.availableClients = clientRes
       
    });

    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }

 
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrders = [];
    this.listOfDisplayOrders = [];

  }

  search(tabSelectedIndex?: number): void {
    this.isSpinning = true;
    this.searchResult = '';
    
    let startCompleteTime : Date = this.searchForm.controls.completeTimeRanger.value ? 
        this.searchForm.controls.completeTimeRanger.value[0] : undefined; 
    let endCompleteTime : Date = this.searchForm.controls.completeTimeRanger.value ? 
        this.searchForm.controls.completeTimeRanger.value[1] : undefined; 
    let specificCompleteDate : Date = this.searchForm.controls.completeDate.value;
    
    let startCreatedTime : Date = this.searchForm.controls.createdTimeRanger.value ? 
        this.searchForm.controls.createdTimeRanger.value[0] : undefined; 
    let endCreatedTime : Date = this.searchForm.controls.createdTimeRanger.value ? 
        this.searchForm.controls.createdTimeRanger.value[1] : undefined; 
    let specificCreatedDate : Date = this.searchForm.controls.createdDate.value;

    console.log(`specificCreatedDate: ${specificCreatedDate}`);

    this.orderService.getOrders(
      this.searchForm.controls.number.value, 
      false, 
      this.searchForm.controls.orderStatus.value, 
      startCompleteTime, 
      endCompleteTime, specificCompleteDate,       
      this.searchForm.controls.orderCategory.value,
      undefined, 
      this.searchForm.controls.customer.value, 
      startCreatedTime, endCreatedTime, specificCreatedDate, 
      undefined, 
      this.searchForm.controls.client.value).subscribe({

        next: (orderRes) => {
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: orderRes.length,
          });
          
          this.listOfAllOrders = this.calculateQuantities(orderRes);  
          this.refreshDetailInformations(orderRes);
          if (tabSelectedIndex) {
            this.tabSelectedIndex = tabSelectedIndex;
          }
        }, 
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      });
  }
  
 
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(orders: Order[]) {  
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingOrderDetailsRequest = 0;
    while (index < orders.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingOrderDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(orders[index]);
      index++;
    } 
    while(this.loadingOrderDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
    // refresh the table while everything is loaded
    // console.log(`mnaually refresh the table`);   
    this.st.reload();  
  }
 
  getCurrentPageOrders() : Order[]{ 
    if (this.listOfAllOrders.length === 0) {
      return [];
    }
    const currentPageDataList : STData[] = this.st.list;
    if (currentPageDataList.length === 0) {
      // we have datas but the table is not loaded, let's just assume 
      // we will return the first page 
      return this.listOfAllOrders.slice((this.st.pi - 1) * this.st.ps, this.st.pi * this.st.ps);

    }
    else {
      // the current page already show datas, let's find the right order 
      return this.listOfAllOrders.filter(order => currentPageDataList.some(orderData => orderData["id"] === order.id));
    } 
  } 
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  refreshDetailInformation(order: Order) {
  
      this.loadClient(order); 
     
      this.loadSupplier(order);

      this.loadCarrier(order);
      
      this.loadCustomer(order); 
      
      this.loadStageLocation(order); 
      
      this.loadOrderLinesInfo(order); 

      this.calculateStatisticQuantities(order);
      
      this.loadBillableActivityInformation(order);

      // this.loadItems(receipt);
  }

  loadClient(order: Order) {
     
    if (order.clientId && order.client == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getClient(order.clientId).subscribe(
        {
          next: (res) => {
            order.client = res;
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    } 
  }
  
  loadCarrier(order: Order) {
     
    if (order.carrierId && order.carrier == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getCarrier(order.carrierId).subscribe(
        {
          next: (res) => {
            order.carrier = res; 
            // load the carrier service level as well
            if (order.carrierServiceLevelId) {
              order.carrierServiceLevel = res.carrierServiceLevels.find(service => service.id === order.carrierServiceLevelId)
            }
          
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    }  
  }
  loadSupplier(order: Order) {
     
    if (order.supplierId && order.supplier == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getSupplier(order.supplierId).subscribe(
        {
          next: (res) => {
            order.supplier = res; 
          
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    }  
  }

  loadBillableActivityInformation(order: Order) {
     order.orderBillableActivities.forEach(
        orderBillableActivity => {

          if (orderBillableActivity.billableActivityTypeId && orderBillableActivity.billableActivityType == null) {
            this.loadingOrderDetailsRequest++;
            this.localCacheService.getBillableActivityType(orderBillableActivity.billableActivityTypeId).subscribe(
              {
                next: (res) => {
                  orderBillableActivity.billableActivityType = res; 
                
                  this.loadingOrderDetailsRequest--;
                }, 
                error: () => this.loadingOrderDetailsRequest--
              }
            );      
          }  
        }
     );

     
     order.orderLines.forEach( 
        orderLine => {
           orderLine.orderLineBillableActivities.forEach(
              orderLineBillableActivity => {
                if (orderLineBillableActivity.billableActivityTypeId && orderLineBillableActivity.billableActivityType == null) {
                  this.loadingOrderDetailsRequest++;
                  this.localCacheService.getBillableActivityType(orderLineBillableActivity.billableActivityTypeId).subscribe(
                    {
                      next: (res) => {
                        orderLineBillableActivity.billableActivityType = res; 
                      
                        this.loadingOrderDetailsRequest--;
                      }, 
                      error: () => this.loadingOrderDetailsRequest--
                    }
                  );      
                }  
              }
           )
        }
     );

  }

  loadCustomer(order: Order) {
     
    if (order.billToCustomerId && order.billToCustomer == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getCustomer(order.billToCustomerId).subscribe(
        {
          next: (res) => {
            order.billToCustomer = res; 
          
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    } 
    
    if (order.shipToCustomerId && order.shipToCustomer == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getCustomer(order.shipToCustomerId).subscribe(
        {
          next: (res) => {
            order.shipToCustomer = res; 
             
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    } 
  }
  
  loadStageLocation(order: Order) {
     
    if (order.stageLocationGroupId && order.stageLocationGroup == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getLocationGroup(order.stageLocationGroupId).subscribe(
        {
          next: (res) => {
            order.stageLocationGroup = res;
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    } 
    if (order.stageLocationId && order.stageLocation == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getLocation(order.stageLocationId).subscribe(
        {
          next: (res) =>{ 
            order.stageLocation = res;
          
            this.loadingOrderDetailsRequest--;
          }, 
          error: () => this.loadingOrderDetailsRequest--
        }
      );      
    } 
  }
  
  loadOrderLinesInfo(order: Order) {
    order.orderLines.forEach(
      orderLine => this.loadOrderLineInfo(orderLine)
    )
  }
  
  loadOrderLineInfo(orderLine: OrderLine) { 
    if (orderLine.inventoryStatusId && orderLine.inventoryStatus == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getInventoryStatus(orderLine.inventoryStatusId).subscribe(
        {
          next: (res) => {
            orderLine.inventoryStatus = res;
            this.loadingOrderDetailsRequest--;
          }
        }
      );      
    } 
    
    if (orderLine.itemId && orderLine.item == null) {
      this.loadingOrderDetailsRequest++;
      this.localCacheService.getItem(orderLine.itemId).subscribe(
        {
          next: (res) => {
            orderLine.item = res;
            this.calculateOrderLineDisplayQuantity(orderLine);
            this.loadingOrderDetailsRequest--;


          }
        }
      );      
    }
    else if (orderLine.item != null) { 
      this.calculateOrderLineDisplayQuantity(orderLine);
    } 
  }
  
  calculateOrderLineDisplayQuantity(ordertLine: OrderLine) : void {  
      if (ordertLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure) {
        // console.log(`>> found displayItemUnitOfMeasure: ${ordertLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure?.name}`)
        let displayItemUnitOfMeasureQuantity  = ordertLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.quantity;

        // console.log(`>> with quantity ${displayItemUnitOfMeasureQuantity}`)

        // console.log(`>> ordertLine.expectedQuantity ${ordertLine.expectedQuantity}`)
        if (ordertLine.expectedQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
          ordertLine.displayUnitOfMeasureForExpectedQuantity = ordertLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure;
          ordertLine.displayExpectedQuantity = ordertLine.expectedQuantity! / displayItemUnitOfMeasureQuantity!
        }
        else {
          // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
          // stock uom
          ordertLine.displayExpectedQuantity! = ordertLine.expectedQuantity!;
          // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
          ordertLine.displayUnitOfMeasureForExpectedQuantity = ordertLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure;
        }
        // console.log(`>> ordertLine.displayExpectedQuantity ${ordertLine.displayExpectedQuantity}`)
        
        if (ordertLine.openQuantity! % displayItemUnitOfMeasureQuantity! ==0) {
          ordertLine.displayOpenQuantity = ordertLine.openQuantity! / displayItemUnitOfMeasureQuantity!
          ordertLine.displayUnitOfMeasureForOpenQuantity = ordertLine.item?.defaultItemPackageType?.displayItemUnitOfMeasure.unitOfMeasure;
        }
        else {
          // the receipt line's quantity can't be devided by the display uom, we will display the quantity in 
          // stock uom
          ordertLine.displayOpenQuantity! = ordertLine.openQuantity!;
          // receiptLine.item!.defaultItemPackageType!.displayItemUnitOfMeasure = receiptLine.item!.defaultItemPackageType!.stockItemUnitOfMeasure;
          ordertLine.displayUnitOfMeasureForOpenQuantity = ordertLine.item?.defaultItemPackageType?.stockItemUnitOfMeasure?.unitOfMeasure;
        }
      }
      else {
        // there's no display UOM setup for this inventory, we will display
        // by the quantity
        ordertLine.displayExpectedQuantity! = ordertLine.expectedQuantity!;
        ordertLine.displayOpenQuantity! = ordertLine.openQuantity!;
      }  
}

  calculateStatisticQuantities(order: Order) {
    order.totalLineCount = order.orderLines.length;
    
    
    order.totalExpectedQuantity = 0;
    order.totalOpenQuantity = 0;
    order.totalInprocessQuantity = 0;
    order.totalShippedQuantity = 0;
    order.totalPendingAllocationQuantity = 0;
    order.totalPickedQuantity = 0;
    order.totalOpenPickQuantity = 0;

    order.orderLines.forEach( 
        orderLine => {
          order.totalExpectedQuantity! += orderLine.expectedQuantity;
          order.totalOpenQuantity! += orderLine.openQuantity;
          order.totalInprocessQuantity! += orderLine.inprocessQuantity;
    
          order.totalShippedQuantity! += orderLine.shippedQuantity;

        } 
    );
    this.loadingOrderDetailsRequest++;
    this.shipmentLineService.getShipmentLinesByOrder(order.id!).subscribe({
      next: (shipmentLineRes) => {
        shipmentLineRes.forEach(shipmentLine => {

          // console.log(`add ${shipmentLine.openQuantity} to totalPendingAllocationQuantity: ${order.totalPendingAllocationQuantity}`);
          order.totalPendingAllocationQuantity! += shipmentLine.openQuantity;
        })
        this.loadingOrderDetailsRequest--;
      }
    });

    this.loadingOrderDetailsRequest++;
    this.pickService.getPicksByOrder(order.id!).subscribe({
      next: (pickRes) => {
        
        order.totalPickedQuantity = pickRes.map(pick => pick.pickedQuantity).reduce((sum, current) => sum + current, 0);
          order.totalOpenPickQuantity = pickRes.map(pick => (pick.quantity - pick.pickedQuantity)).reduce((sum, current) => sum + current, 0);
          this.loadingOrderDetailsRequest--;
      }
    })
     

  }

/**
 *  
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

 */
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

  onItemChecked(id: number, orderId: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus(orderId);
  }

  onAllChecked(value: boolean, orderId: number): void {
    this.mapOfPicks[orderId].filter(item => item.pickedQuantity < item.quantity).forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus(orderId);
  }
 

  refreshCheckedStatus(orderId: number): void {
    this.checked = this.mapOfPicks[orderId].every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.mapOfPicks[orderId].some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }
  /**
   *  
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
    this.showAllOrderDetails();
  }
  
   */

  allocateOrder(order: Order): void {
    this.isSpinning = true;
    this.orderService.allocateOrder(order).subscribe(orderRes => {
      this.messageService.success(this.i18n.fanyi('message.allocate.success'));
      this.isSpinning = false;
      this.search();
    }, 
    () =>  this.isSpinning = false);
  }

  
  printPackingSlip(event: any, order: Order) {

    this.isSpinning = true;

    this.orderService.generateOrderPackingList(
      order)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        // console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "Packing Slip",
          printResult.fileName,
          ReportType.PACKING_SLIP,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Portrait,
          PrintPageSize.Letter,
          order.number, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewPackingSlip(order: Order): void {


    this.isSpinning = true;
    this.orderService.generateOrderPackingList(
      order)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }

  
  printBillOfLading(event: any, order: Order) {

    this.isSpinning = true;

    this.orderService.generateOrderBillOfLading(
      order)
      .subscribe(printResult => {

        // send the result to the printer
        const printFileUrl
          = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        // console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "Bill Of Lading",
          printResult.fileName,
          ReportType.BILL_OF_LADING,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Portrait,
          PrintPageSize.Letter,
          order.number, 
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewBillOfLading(order: Order): void {


    this.isSpinning = true;
    this.orderService.generateOrderBillOfLading(
      order)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }

  completeOrder(order: Order): void {
    if (order.category === OrderCategory.OUTSOURCING_ORDER) {
      // if this is a outsourcing order, we will flow to a page to let the user
      // specify the shipped quantity, in order to complete the order

      this.router.navigateByUrl(`/outbound/complete-order?id=${order.id}`);
    }
    else {
      // for orders fulfilled by the warehouse, let's directly close the order      
      this.isSpinning = true;
      this.orderService.completeOrder(order).subscribe(orderRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search();
      }, 
      () =>  this.isSpinning = false);
    } 
  }
  isOrderAllocatable(order: Order): boolean {
    return this.orderService.isOrderAllocatable(order);
  }
  canReassignStageLocation(order: Order): boolean {
    return order.totalInprocessQuantity === 0 && !this.orderService.isOutsourcingOrder(order);
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
      this.showParcelPackages(order);
    // }
  }

  /**
   * 
  showAllOrderDetails(): void {

    this.listOfDisplayOrders.forEach(order => {
      if (this.expandSet.has(order.id!)) {
        this.showPicks(order);
        this.showShortAllocations(order);
        this.showPickedInventory(order);
      }
    });
  }
   */
  showPicks(order: Order): void {
    this.pickService.getPicksByOrder(order.id!).subscribe(pickRes => {
      this.mapOfPicks[order.id!] = [...pickRes];
    });
  }
  showShortAllocations(order: Order): void {
    this.shortAllocationService
      .getShortAllocationsByOrder(order.id!)
      .subscribe(shortAllocationRes => {
        this.mapOfShortAllocations[order.id!] = shortAllocationRes.filter(
          shortAllocation => shortAllocation.status != ShortAllocationStatus.CANCELLED
        )
      } );
  }
  showParcelPackages(order: Order): void {
    this.parcelPackageService
      .getAll(order.id!)
      .subscribe({
        next: (packageRes) => {
          this.mapOfParcelPackages[order.id!] = packageRes;
        }
      });
  }
  showPickedInventory(order: Order): void {
    // Get all the picks and then load the pikced inventory
    this.pickService.getPicksByOrder(order.id!).subscribe(pickRes => {
      if (pickRes.length === 0) {
        this.mapOfPickedInventory[order.id!] = [];
      } else {
        this.pickService.getPickedInventories(pickRes, true).subscribe(pickedInventoryRes => {
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

  cancelPick(order: Order, pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe(pickRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.isSpinning = false;
      this.search(1);
    });
  }
  openUnpickModal(
    order: Order,
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
      locationName: new UntypedFormControl({ value: inventory.location!.name, disabled: true }),
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
      this.search(2);
    });
  }

  cancelShortAllocation(order: Order, shortAllocation: ShortAllocation): void {
    this.isSpinning = true;
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the short allocation
        this.search(3);
      }, 
      error: () => this.isSpinning = false
    });
     
  }

  isShortAllocationAllocatable(shortAllocation: ShortAllocation): boolean {
    return shortAllocation.openQuantity > 0;
  }
  allocateShortAllocation(order: Order, shortAllocation: ShortAllocation): void {
    
    this.isSpinning = true;
    this.shortAllocationService.allocateShortAllocation(shortAllocation).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the short allocation
        this.search(3);
      }, 
      error: () => this.isSpinning = false
    });
  }

  printPickSheets(order: Order, event: any): void {
    this.isSpinning = true;
    console.log(`start to print ${order.number} from ${JSON.stringify(event)}`);

    this.orderService
      .printOrderPickSheet(order, this.i18n.currentLang)
      .subscribe(printResult => {

        // send the result to the printer
        this.printingService.printFileByName(
          "order pick sheet",
          printResult.fileName,
          ReportType.ORDER_PICK_SHEET,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount, PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          order.number,
          printResult);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      });

  }
  previewReport(order: Order): void {
    this.isSpinning = true;
    console.log(`start to preview ${order.number}`);
    
    this.orderService.printOrderPickSheet(order, this.i18n.currentLang).subscribe({
      next: (printResult)=> {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        sessionStorage.setItem("report_previous_page", `outbound/order?number=${order.number}`);
        
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);
  
      }, 
      error: () => this.isSpinning = false
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
      currentStageLocationGroup: new UntypedFormControl({ value: order.stageLocationGroup?.description, disabled: true}),
      currentStageLocation: new UntypedFormControl({ value:  order.stageLocation?.name, disabled: true}),
      stageLocationGroupId: new UntypedFormControl({ value: order.stageLocationGroupId }),
      stageLocationId: new UntypedFormControl({ value:  order.stageLocationGroupId }),
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
    { title: this.i18n.fanyi("order.number"), 
      render: 'orderNumberColumn',
      fixed: 'left', iif: () => this.isChoose('number'), width: 50},
    { title: this.i18n.fanyi("order.category"), 
      index: 'category', fixed: 'left',
      format: (item, _col, index) => this.i18n.fanyi(`ORDER-CATEGORY-${ item.category}` ), 
      
      iif: () => this.isChoose('category'), width: 150},
    { title: this.i18n.fanyi("status"), index: 'status',fixed: 'left', iif: () => this.isChoose('status'), width: 150 },   
    
    { title: this.i18n.fanyi("client"), index: 'client.name', iif: () => this.threePartyLogisticsFlag && this.isChoose('client'), width: 150},
    {
      title: this.i18n.fanyi("supplier"),
      // renderTitle: 'customTitle',
      render: 'supplierColumn',
      iif: () => this.isChoose('supplier'), width: 150
    },
    {
      title: this.i18n.fanyi("carrier"),
      // renderTitle: 'customTitle',
      render: 'carrierColumn',
      iif: () => this.isChoose('carrier'), width: 150
    },
    {
      title: this.i18n.fanyi("service"),
      // renderTitle: 'customTitle',
      render: 'carrierServiceColumn',
      iif: () => this.isChoose('carrierService'), width: 150
    },
    {
      title: this.i18n.fanyi("shipToCustomer"),
      // renderTitle: 'customTitle',
      render: 'shipToCustomerColumn',
      iif: () => this.isChoose('shipToCustomer'), width: 150
    },
    {
      title: this.i18n.fanyi("shipToCustomer"),
      // renderTitle: 'customTitle',
      render: 'shipToCustomeAddressColumn',
      iif: () => this.isChoose('shipToCustomerAddress'), width: 150
    },
    {
      title: this.i18n.fanyi("order.billToCustomer"),
      // renderTitle: 'customTitle',
      render: 'billToCustomerColumn',
      iif: () => this.isChoose('billToCustomer'), width: 150
    },
    {
      title: this.i18n.fanyi("order.billToCustomer"),
      // renderTitle: 'customTitle',
      render: 'billToCustomerAddressColumn',
      iif: () => this.isChoose('billToCustomerAddress'), width: 150
    },
    { title: this.i18n.fanyi("order.totalItemCount"), index: 'totalItemCount', iif: () => this.isChoose('totalItemCount'), width: 150},
    { title: this.i18n.fanyi("order.totalOrderQuantity"), index: 'totalExpectedQuantity', iif: () => this.isChoose('totalExpectedQuantity'), width: 150 },
    { title: this.i18n.fanyi("order.totalOpenQuantity"), index: 'totalOpenQuantity', iif: () => this.isChoose('totalOpenQuantity'), width: 100 },
    { title: this.i18n.fanyi("shipment.stage.locationGroup"), index: 'stageLocationGroup.description', iif: () => this.isChoose('stageLocationGroup'),width: 100 },
    { title: this.i18n.fanyi("shipment.stage.location"), index: 'stageLocation.name', iif: () => this.isChoose('stageLocation'), width: 100},    
    { title: this.i18n.fanyi("order.totalInprocessQuantity"), index: 'totalInprocessQuantity', iif: () => this.isChoose('totalInprocessQuantity'), width: 100},
    {
      title: this.i18n.fanyi('order.totalInprocessQuantity'),
      iif: () => this.isChoose('totalInprocessQuantity'),
      children: [
        { title: this.i18n.fanyi("order.totalPendingAllocationQuantity"), index: 'totalPendingAllocationQuantity', iif: () => this.isChoose('totalPendingAllocationQuantity'), }, 
        { title: this.i18n.fanyi("order.totalOpenPickQuantity"), index: 'totalOpenPickQuantity', iif: () => this.isChoose('totalOpenPickQuantity'), }, 
        { title: this.i18n.fanyi("order.totalPickedQuantity"), index: 'totalPickedQuantity', iif: () => this.isChoose('totalPickedQuantity'), },    
      ],width: 100
    },
    { title: this.i18n.fanyi("order.totalShippedQuantity"), index: 'totalShippedQuantity', iif: () => this.isChoose('totalShippedQuantity'), width: 100},     
    { title: this.i18n.fanyi("order.cancelRequested"), index: 'cancelRequested', iif: () => this.isChoose('cancelRequested'), width: 200 , type: 'yn'},     
    { title: this.i18n.fanyi("order.cancelRequestedTime"), render: 'cancelRequestedTimeColumn', iif: () => this.isChoose('cancelRequestedTimeColumn'), width: 200},     
    { title: this.i18n.fanyi("order.cancelRequestedUsername"), index: 'cancelRequestedUsername', iif: () => this.isChoose('cancelRequestedUsername'), width: 200},     
    { 
      title: this.i18n.fanyi("action"),fixed: 'right',width: 150, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
    /**
     * 
    {
      title: 'print',
      renderTitle: 'printColumnTitle',fixed: 'right',width: 210, 
      render: 'printColumn',
    },
     * 
     */
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("order.number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("order.category"), value: 'category', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("supplier"), value: 'supplier', checked: true },
    { label: this.i18n.fanyi("client"), value: 'client', checked: true },
    { label: this.i18n.fanyi("carrier"), value: 'carrier', checked: true },
    { label: this.i18n.fanyi("carrierService"), value: 'carrierService', checked: true },
    { label: this.i18n.fanyi("shipToCustomer"), value: 'shipToCustomer', checked: true },
    { label: this.i18n.fanyi("shipToCustomer"), value: 'shipToCustomerAddress', checked: true },
    { label: this.i18n.fanyi("order.billToCustomer"), value: 'billToCustomer', checked: true },
    { label: this.i18n.fanyi("order.billToCustomer"), value: 'billToCustomerAddress', checked: true },
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
    { label: this.i18n.fanyi("order.cancelRequested"), value: 'cancelRequested', checked: true },
    { label: this.i18n.fanyi("order.cancelRequestedTime"), value: 'cancelRequestedTimeColumn', checked: true },
    { label: this.i18n.fanyi("order.cancelRequestedUsername"), value: 'cancelRequestedUsername', checked: true },
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  
  @ViewChild('parcelPackageTable', { static: true })
  parcelPackageTable!: STComponent;
  parcelPackageTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("trackingCode"), 
      render: 'trackingCodeColumn', width: 150},
    { title: this.i18n.fanyi("status"),  index: 'status',  },
    { title: this.i18n.fanyi("status"),  index: 'statusDescription',  },
    { title: this.i18n.fanyi("shippedDate"), 
      render: 'shippedDateColumn' },
    { title: this.i18n.fanyi("size"), 
        render: 'sizeColumn' },
    { title: this.i18n.fanyi("weight"), 
          render: 'weightColumn' },
    { title: this.i18n.fanyi("carrier"),  index: 'carrier',  },
    { title: this.i18n.fanyi("service"),  index: 'service',  },
    { title: this.i18n.fanyi("deliveryDays"),  index: 'deliveryDays',  },
    { title: this.i18n.fanyi("rate"), render: 'rateColumn',    },
    { title: this.i18n.fanyi("insurance"),  render: 'insuranceColumn',   },  
    { title: this.i18n.fanyi("label"), 
          render: 'labelColumn' },   
    { title: this.i18n.fanyi("action"),fixed: 'right',width: 150, 
            render: 'actionColumn',
            iif: () => !this.displayOnly },
  ];

  orderTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showOrderDetails(event.expand);
    } 

  }

  
  isOrderReadyForRemove(order: Order): boolean {
    // if the order has not been planned into shipment
    // or if it is planned but we don't have any pick / short allocation yet
    // then we are allowed to remove the shipment
    return order.totalInprocessQuantity === 0 ||
        order.totalInprocessQuantity === order.totalPendingAllocationQuantity;
  }

  removeOrder(order: Order) : void{
    this.isSpinning = true;
    this.orderService.removeOrder(order).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    });

  }

  cancelSelectedPick(order: Order, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    const picks :PickWork[] = [];
    this.mapOfPicks[order.id!]
      .filter(pick => this.setOfCheckedId.has(pick.id!))
      .forEach(pick => { 
        picks.push(pick);
      });
 
      if (picks.length ===0) {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        return;
      }
      this.pickService.cancelPicks(picks, errorLocation, generateCycleCount).subscribe({
        next: () => {
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.isSpinning = false;
          this.search();
        }, 
        error: () => {
          
          this.messageService.error(this.i18n.fanyi("message.action.fail"));
          this.isSpinning = false;
        }
      }) 
  }
  isAlreadyCompleted(order: Order) : boolean {
    return order.status === OrderStatus.COMPLETE;
  }
  retriggerOrderConfirmationIntegration(order: Order) {
    this.isSpinning = true;
    
    this.orderService.retriggerOrderConfirmationIntegration(order).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => {
        
        this.messageService.error(this.i18n.fanyi("message.action.fail"));
        this.isSpinning = false;
      }
    }) 
  }

  
  openCreateWorkOrderModel(
    shortAllocation: ShortAllocation,
    tplCreateWorkOrderModalTitle: TemplateRef<{}>,
    tplCreateWorkOrderModalContent: TemplateRef<{}>,
  ): void { 
    // get all the valid BOM for the item in short
    if (!shortAllocation.item.name) {

      this.messageService.error(this.i18n.fanyi("ERROR-NO-ITEM-INFO-FOR-SHORT-ALLOCATION"));
      return;
    }
    this.isSpinning = true;
    this.availableBOM = [];
    this.billOfMaterialService.getBillOfMaterials(undefined, shortAllocation.item.name).subscribe(
      {
        next: (bomRes) => {

          this.availableBOM = bomRes;
          if (this.availableBOM.length == 0 ) {
            
              this.messageService.error(this.i18n.fanyi("ERROR-NO-BOM-INFO-FOR-ITEM"));
              this.isSpinning = false;
          }
          else {
            // open the modal
            this.createWorkOrderForm = this.fb.group({
              itemName: new UntypedFormControl({ value: shortAllocation.item.name, disabled: true}),
              shortQuantity: new UntypedFormControl({ value:  shortAllocation.openQuantity, disabled: true}),
              bom: new UntypedFormControl(),
              workOrderNumber: new UntypedFormControl(),
              workOrderQuantity: new UntypedFormControl({ value: shortAllocation.openQuantity, disabled: false }),
            });
            this.displayBom = undefined;
            this.setupDefaultDisplayBOM();

            this.isSpinning = false;
             
              this.createWorkOrderModal = this.modalService.create({
                nzTitle: tplCreateWorkOrderModalTitle,
                nzContent: tplCreateWorkOrderModalContent,
                nzOkText: this.i18n.fanyi('confirm'),
                nzCancelText: this.i18n.fanyi('cancel'),
                nzMaskClosable: false,
                nzOnCancel: () => {
                  this.createWorkOrderModal.destroy();
                  
                },
                nzOnOk: () => {
                  this.isSpinning = true;
                  this.shortAllocationService.createWorkOrder(
                    shortAllocation,
                    this.createWorkOrderForm.controls.bom.value,
                    this.createWorkOrderForm.controls.workOrderNumber.value,
                    this.createWorkOrderForm.controls.workOrderQuantity.value,
                  ).subscribe({
                    next: () => {
                      
                      this.isSpinning = false;
                      this.messageService.success(this.i18n.fanyi('message.action.success')); 
                      this.search();
                    }, 
                    error: () => {this.isSpinning = false}
                  });
                },

                nzWidth: 1000,
              });

          }
         }, 
        error: () => this.isSpinning = false
      }
    )


  }
  
  setupDefaultDisplayBOM(): void {
    if (this.availableBOM.length === 1) {
      this.createWorkOrderForm!.controls.bom.setValue(this.availableBOM[0].id);
      this.displayBom = this.availableBOM[0];
    }
  }
  workOrderNumberChanged(workOrderNumber: string) {
    
    this.createWorkOrderForm.controls.workOrderNumber.setValue(workOrderNumber);
  }
  
  getOrderDocumentFileUrl(orderDocument : OrderDocument) : string { 

      return `${environment.api.baseUrl}/outbound/orders/documents/${orderDocument.id}/download`; 
     
  }

  removeOrderDocument(orderDocument : OrderDocument) { 
    this.isSpinning = true;
      this.orderDocumentService.removeOrderDocument(orderDocument.id!).subscribe({
        next: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success')); 
          this.search();
        }, 
        error: () => this.isSpinning = false
      })
    
   
  }

  
  printParcelLabel(event: any, parcelPackage: ParcelPackage): void {
    this.isSpinning = true;  
    
    this.easyPostConfigurationService.getConfiguration().subscribe({
      next: (easyPostConfiguration) => {

        // get the configuration for the current carrier and see 
        // what type of report needs to be printed
        const easyPostCarrier  = 
            easyPostConfiguration.carriers.find(
              easyPostCarrier =>  easyPostCarrier.carrier?.name === parcelPackage.carrier  
            )
        if (easyPostCarrier == null) {
          this.isSpinning = false;
          this.messageService.error(`${parcelPackage.carrier}  ${this.i18n.fanyi("not-defined-by-easy-post")}`);
        }
        else {

          console.log(`start to print parcel level for carrier ${easyPostCarrier.carrier?.name}, report type: ${easyPostCarrier.reportType}`)
          // send the result to the printer
          this.printingService.printFileByURL( 
            parcelPackage.labelUrl,
            easyPostCarrier.reportType,
            event.printerName,
            event.physicalCopyCount) ;
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi("report.print.printed")); 
        } 


      }, 
      error: () => this.isSpinning = false
    })

  }

  previewParcelLevel(parcelPackage: ParcelPackage): void {
    // window.open(parcelPackage.labelUrl, '_blank');
    console.log(`open label url ${parcelPackage.labelUrl}`);

    window.open(parcelPackage.labelUrl);
    // this.router.navigateByUrl(parcelPackage.labelUrl, );
  }

  changeDisplayItemUnitOfMeasureForExpectedQuantity(orderLine: OrderLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (orderLine.expectedQuantity! % itemUnitOfMeasure.quantity! == 0) {

      orderLine.displayExpectedQuantity = orderLine.expectedQuantity! / itemUnitOfMeasure.quantity!;
      orderLine.displayUnitOfMeasureForExpectedQuantity = itemUnitOfMeasure.unitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the line's expected quantity ${ 
        orderLine.expectedQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }
  
  changeDisplayItemUnitOfMeasureForOpenQuantity(orderLine: OrderLine, itemUnitOfMeasure: ItemUnitOfMeasure) {

    
    // see if the inventory's quantity can be divided by the item unit of measure
    // if so, we are allowed to change the display UOM and quantity
    if (orderLine.openQuantity! % itemUnitOfMeasure.quantity! == 0) {

      orderLine.displayOpenQuantity = orderLine.openQuantity! / itemUnitOfMeasure.quantity!;
      orderLine.displayUnitOfMeasureForOpenQuantity = itemUnitOfMeasure.unitOfMeasure;
    }
    else {
      this.messageService.error(`can't change the display quantity as the line's expected quantity ${ 
        orderLine.openQuantity  } can't be divided by uom ${  itemUnitOfMeasure.unitOfMeasure?.name 
          }'s quantity ${  itemUnitOfMeasure.quantity}`);
    }
  }

  @ViewChild('stOrderBillableActivityTable', { static: false })
  stOrderBillableActivityTable!: STComponent;
  orderBillableActivityTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("billable-activity-type"), index: 'billableActivityType.description', width: 150 },    
    {
      title: this.i18n.fanyi("rate"), index: 'rate' , type:'currency',  width: 150,
      currency: {
        format: {
          useAngular: true ,          
          ngCurrency: {
              display:  'symbol' ,  
          },
        }
      }
    }, 
    {
      title: this.i18n.fanyi("amount"), index: 'amount' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("totalCharge"), index: 'totalCharge', type:'currency' ,  width: 150,
      currency: {
        format: {
          useAngular: true ,          
          ngCurrency: {
              display:  'symbol' ,  
          },
        }
      }
    }, 
    { title: this.i18n.fanyi("activityTime"), render: 'activityTimeColumn', width: 150 }, 
    { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 , 
    iif: () => !this.displayOnly},       
  ];

  @ViewChild('stOrderLineBillableActivityTable', { static: false })
  stOrderLineBillableActivityTable!: STComponent;
  orderLineBillableActivityTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("billable-activity-type"), index: 'billableActivityType.description', width: 150 },    
    {
      title: this.i18n.fanyi("rate"), index: 'rate' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("amount"), index: 'amount' ,  width: 150,
    }, 
    {
      title: this.i18n.fanyi("totalCharge"), index: 'totalCharge' ,  width: 150,
    }, 
    { title: this.i18n.fanyi("activityTime"), render: 'activityTimeColumn', width: 150 },    
    { title: this.i18n.fanyi("action"), render: 'actionColumn', width: 150 , 
    iif: () => !this.displayOnly},       
  ];
   

  removeOrderBillableActivity(order: Order, 
    orderBillableActivity: OrderBillableActivity) {

    this.orderService.removeOrderBillableActivity(
      order.id!, orderBillableActivity.id!
    ).subscribe({
      next: () => {

        order.orderBillableActivities = order.orderBillableActivities.filter(
          existingOrderBillableActivity => existingOrderBillableActivity.id != orderBillableActivity.id
        );
      }
    })
  }

  removeOrderLineBillableActivity(orderLine: OrderLine, 
    orderLineBillableActivity: OrderLineBillableActivity) {

      this.isSpinning = true;
      // console.log(`start to remove order line billable activity`);

      this.orderLineService.removeOrderLineBillableActivity(
        orderLine.id!, orderLineBillableActivity.id!
      ).subscribe({
        next: () => {
          
          this.isSpinning = false;
          
          orderLine.orderLineBillableActivities = orderLine.orderLineBillableActivities.filter(
            existingOrderLineBillableActivity => existingOrderLineBillableActivity.id != orderLineBillableActivity.id
          ); 
        }
      })
  }
 
  
  openAddOrderActivityModal(
    order: Order,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {

    this.openAddActivityModal(
      order, 
      undefined, 
      tplBillableActivityModalTitle,
      tplBillableActivityModalContent,
      tplBillableActivityModalFooter,

    )
  }
  
  openAddOrderLineActivityModal(
    order: Order,
    orderLine: OrderLine,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {
    this.openAddActivityModal(
      order, 
      orderLine, 
      tplBillableActivityModalTitle,
      tplBillableActivityModalContent,
      tplBillableActivityModalFooter,

    )
  }

  openAddActivityModal(
    order: Order,
    orderLine: OrderLine | undefined,
    tplBillableActivityModalTitle: TemplateRef<{}>,
    tplBillableActivityModalContent: TemplateRef<{}>,
    tplBillableActivityModalFooter: TemplateRef<{}>,
  ): void {
    // make sure the item is ready for receiving  
    this.billableActivityOrder = order;
    this.billableActivityOrderLine = orderLine;
  
    this.billableActivityForm = this.fb.group({ 
      billableActivityType: ['', Validators.required],
      activityTime:  ['', Validators.required],
      rate: [''],
      amount: [''],
      totalCharge: ['', Validators.required],
    });

    // show the model
    this.billableActivityModal = this.modalService.create({
      nzTitle: tplBillableActivityModalTitle,
      nzContent: tplBillableActivityModalContent,
      nzFooter: tplBillableActivityModalFooter,
      nzWidth: 1000,
    });
    
  }
  closeBillableActivityModal(): void {
    this.billableActivityModal.destroy(); 
  }
  confirmBillableActivity(): void {  
    
    this.addActivityInProcess = true;
    if (this.billableActivityForm.valid) {
      
      if (this.billableActivityOrderLine) {

        const orderLineBillableActivity : OrderLineBillableActivity = {        
          billableActivityTypeId: this.billableActivityForm.controls.billableActivityType.value,
          activityTime: this.billableActivityForm.controls.activityTime.value,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityOrder?.clientId,
          rate: this.billableActivityForm.controls.rate.value,
          amount: this.billableActivityForm.controls.amount.value,
          totalCharge: this.billableActivityForm.controls.totalCharge.value,
        }
        this.orderLineService.addOrderLineBillableActivity(this.billableActivityOrderLine.id!, 
          orderLineBillableActivity).subscribe({
          next: () => {
            
            this.addActivityInProcess = false;
            this.billableActivityModal.destroy();
            
            this.searchForm!.controls.number.setValue(this.billableActivityOrder!.number);
            this.search();
          },
          error: () => this.addActivityInProcess = false
        });
      }
      else {

        const orderBillableActivity : OrderBillableActivity = {        
          billableActivityTypeId: this.billableActivityForm.controls.billableActivityType.value,
          activityTime: this.billableActivityForm.controls.activityTime.value,
          warehouseId: this.warehouseService.getCurrentWarehouse().id,
          clientId:  this.billableActivityOrder?.clientId,
          rate: this.billableActivityForm.controls.rate.value,
          amount: this.billableActivityForm.controls.amount.value,
          totalCharge: this.billableActivityForm.controls.totalCharge.value,
        }
        this.orderService.addOrderBillableActivity(
          this.billableActivityOrder!.id!, orderBillableActivity).subscribe({
          next: () => {
            this.addActivityInProcess = false;
            this.billableActivityModal.destroy();
            
            this.searchForm!.controls.number.setValue(this.billableActivityOrder!.number);
            this.search();
          }, 
          error: () => this.addActivityInProcess = false
        });
      } 
    } else {
      this.displayBillableActivityFormError(this.billableActivityForm);
      this.addActivityInProcess = false; 
    }
  }
  displayBillableActivityFormError(fromGroup: UntypedFormGroup): void {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  
  recalculateTotalCharge(): void { 
    
    if (this.billableActivityForm.controls.rate.value != null &&
      this.billableActivityForm.controls.amount.value != null) {

        this.billableActivityForm!.controls.totalCharge.setValue(
          this.billableActivityForm.controls.rate.value * 
          this.billableActivityForm.controls.amount.value
        );
        
      } 
  }

   
  @ViewChild('stOrderLine', { static: false })
  stOrderLine!: STComponent;
  stOrderLineTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("order.line.number"), index: 'number', width: 150 },  
    { title: this.i18n.fanyi("item"), render: 'itemColumn',   width: 150 },  
    { title: this.i18n.fanyi("color"), index: 'color', width: 150 },  
    { title: this.i18n.fanyi("productSize"), index: 'productSize', width: 150 },  
    { title: this.i18n.fanyi("style"), index: 'style', width: 150 },  
    { title: this.i18n.fanyi("allocateByReceiptNumber"), render: 'allocateByReceiptNumberColumn', width: 150 },  
    { title: this.i18n.fanyi("order.line.expectedQuantity"), render: 'displayExpectedQuantityColumn',  width: 150 },  
    { title: this.i18n.fanyi("order.line.openQuantity"), render: 'displayOpenQuantityColumn', width: 150 },  
    { title: this.i18n.fanyi("order.line.inprocessQuantity"), index: 'inprocessQuantity', width: 150 },  
    { title: this.i18n.fanyi("production-plan.line.inprocessQuantity"), index: 'productionPlanInprocessQuantity', width: 150 },  
    { title: this.i18n.fanyi("production-plan.line.producedQuantity"), index: 'productionPlanProducedQuantity', width: 150 },  
    { title: this.i18n.fanyi("order.line.shippedQuantity"), index: 'shippedQuantity', width: 150 },  
    { title: this.i18n.fanyi("inventory.status"), render: 'inventoryStatusColumn', width: 150 },  
    { title: this.i18n.fanyi("order.line.allocationStrategyType"), render: 'allocationStrategyTypeColumn', width: 150 }, 
      
    {
      title: this.i18n.fanyi("action"), 
      render: 'actionColumn', 
      width: 250,
      fixed: 'right',
      iif: () => !this.displayOnly

    },   
  ];
 
  formatterDollar = (value: number): string => `$ ${value}`;
  parserDollar = (value: string): string => value.replace('$ ', '');

  removePackage(parcelPackage: ParcelPackage) {

    this.isSpinning = true;
    this.parcelPackageService.remove(parcelPackage.id!).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.search(6);
      }, 
      error: () => this.isSpinning = false
    })
  }

  isOrderReadyForCancellation(order: Order) : boolean {
    return order.status != OrderStatus.COMPLETE &&
            order.status != OrderStatus.CANCELLED;
  }

  isOrderReadyForClearCancellationRequest(order: Order) : boolean {
     // the user is allowed to cancel the cancel request only if the order
     // is not complete and cancelled yet
    return order.status != OrderStatus.COMPLETE &&
            order.status != OrderStatus.CANCELLED &&
            order.cancelRequested == true;
  }

  cancelOrder(order: Order) : void{
    this.isSpinning = true;
    this.orderService.cancelOrder(order.id!).subscribe({
      next: (orderCancellationRequest) => {
        if (orderCancellationRequest.result == OrderCancellationRequestResult.FAIL) {

          this.messageService.error(orderCancellationRequest.message);
        }
        else if (orderCancellationRequest.result == OrderCancellationRequestResult.REQUESTED) {

          this.messageService.success(this.i18n.fanyi("order-cancellation-request-sent")); 
        }
        else if (orderCancellationRequest.result == OrderCancellationRequestResult.CANCELLED) {

          this.messageService.success(this.i18n.fanyi("order-cancelled")); 
        }
        this.isSpinning = false; 
        this.search();
      }, 
      error: () => this.isSpinning = false
    });

  } 
  clearCancellationRequest(order: Order) : void{
    this.isSpinning = true;
    this.orderService.clearCancellationRequest(order.id!).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    });

  } 
}
