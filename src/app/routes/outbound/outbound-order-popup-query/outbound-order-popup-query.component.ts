import { formatDate } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Customer } from '../../common/models/customer';
import { CustomerService } from '../../common/services/customer.service'; 
import { Inventory } from '../../inventory/models/inventory'; 
import { LocalCacheService } from '../../util/services/local-cache.service'; 
import { Order } from '../models/order';
import { OrderCategory } from '../models/order-category';
import { OrderLine } from '../models/order-line';
import { OrderStatus } from '../models/order-status.enum';
import { PickWork } from '../models/pick-work';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { OrderService } from '../services/order.service';
import { PickService } from '../services/pick.service';
import { ShipmentLineService } from '../services/shipment-line.service';
import { ShortAllocationService } from '../services/short-allocation.service';

@Component({
    selector: 'app-outbound-outbound-order-popup-query',
    templateUrl: './outbound-order-popup-query.component.html',
    styleUrls: ['./outbound-order-query-popup.component.less'],
    standalone: false
})
export class OutboundOutboundOrderPopupQueryComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  scrollX = '100vw';
 
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
    { title: 'id', index: 'id', type: 'radio' },
    { title: this.i18n.fanyi("order.number"), 
      render: 'orderNumberColumn',
      fixed: 'left',  width: 50},
    { title: this.i18n.fanyi("order.category"), 
      index: 'category', fixed: 'left',
      format: (item, _col, index) => this.i18n.fanyi(`ORDER-CATEGORY-${ item.category}` ), 
      
        width: 150},
    { title: this.i18n.fanyi("status"), index: 'status',fixed: 'left',   width: 150 },   
    
    {
      title: this.i18n.fanyi("supplier"),
      // renderTitle: 'customTitle',
      render: 'supplierColumn', width: 150
    },

    {
      title: this.i18n.fanyi("shipToCustomer"),
      // renderTitle: 'customTitle',
      render: 'shipToCustomerColumn',  width: 150
    },
    {
      title: this.i18n.fanyi("order.billToCustomer"),
      // renderTitle: 'customTitle',
      render: 'billToCustomerColumn', width: 150
    },
    { title: this.i18n.fanyi("order.totalItemCount"), index: 'totalItemCount',   width: 150},
    { title: this.i18n.fanyi("order.totalOrderQuantity"), index: 'totalExpectedQuantity',  width: 150 },
    { title: this.i18n.fanyi("order.totalOpenQuantity"), index: 'totalOpenQuantity',   width: 100 },
    { title: this.i18n.fanyi("shipment.stage.locationGroup"), index: 'stageLocationGroup.description',  width: 100 },
    { title: this.i18n.fanyi("shipment.stage.location"), index: 'stageLocation.name',   width: 100},    
    { title: this.i18n.fanyi("order.totalInprocessQuantity"), index: 'totalInprocessQuantity', width: 100},
    {
      title: this.i18n.fanyi('order.totalInprocessQuantity'), 
      children: [
        { title: this.i18n.fanyi("order.totalPendingAllocationQuantity"), index: 'totalPendingAllocationQuantity',  }, 
        { title: this.i18n.fanyi("order.totalOpenPickQuantity"), index: 'totalOpenPickQuantity',   }, 
        { title: this.i18n.fanyi("order.totalPickedQuantity"), index: 'totalPickedQuantity',   },    
      ],width: 100
    },
    { title: this.i18n.fanyi("order.totalShippedQuantity"), index: 'totalShippedQuantity', width: 100},     
     
   
  ];

  searching = false;
  queryInProcess = false;
  searchResult = '';
   
  orderStatuses = OrderStatus;
  orderStatusesKeys = Object.keys(this.orderStatuses);
  orderCategories = OrderCategory;
  orderCategoriesKeys = Object.keys(this.orderCategories);

  // Table data for display
  listOfAllOrders: Order[] = []; 

  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};

  mapOfPickedInventory: { [key: string]: Inventory[] } = {};
 
  loadingOrderDetailsRequest = 0;

  validCustomers: Customer[] = [];
  filterValidCustomers: Customer[] = [];

  @Output() readonly recordSelected: EventEmitter<any> = new EventEmitter();
  @Input() customerName?: string = '';

  constructor(
    private fb: UntypedFormBuilder, 
    private modalService: NzModalService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private pickService: PickService,
    private shortAllocationService: ShortAllocationService, 
    private localCacheService: LocalCacheService,
    private shipmentLineService: ShipmentLineService,
  ) { }
 
  ngOnInit(): void { 
    this.loadValidCustomers();
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrders = []; 
  }

  search(): void {
    this.searching = true;
    
    this.orderService.getOrders(
      this.searchForm.value.number, 
      false, 
      this.searchForm.value.orderStatus, 
      undefined, 
      undefined, undefined,       
      this.searchForm.value.orderCategory,
      this.searchForm.value.customer).subscribe(
      orderRes => {
 

        // this.collapseAllRecord(expandedOrderId);

        this.searching = false;
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: orderRes.length,
        });
        
        this.listOfAllOrders = this.calculateQuantities(orderRes);  
        this.refreshDetailInformations(orderRes); 
      },
      () => {
        this.searching = false;
        this.searchResult = '';
      },
    );
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
    console.log(`mnaually refresh the table`);   
    this.st.reload();  
  }
 
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  refreshDetailInformation(order: Order) {
  
    this.loadClient(order); 
   
    this.loadSupplier(order);
    
    this.loadCustomer(order); 
    
    this.loadStageLocation(order); 
    
    this.loadOrderLinesInfo(order); 

    this.calculateStatisticQuantities(order);

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
        }
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
        }
      }
    );      
  }  
}

loadCustomer(order: Order) {
   
  if (order.billToCustomerId && order.billToCustomer == null) {
    this.loadingOrderDetailsRequest++;
    this.localCacheService.getCustomer(order.billToCustomerId).subscribe(
      {
        next: (res) => {
          order.billToCustomer = res; 
        
          this.loadingOrderDetailsRequest--;
        }
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
        }
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
        }
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
        }
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
          this.loadingOrderDetailsRequest--;
        }
      }
    );      
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

  orderTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showOrderDetails(event.expand);
    } 
    else if (event.type === 'radio') {

      const dataList: STData[] = this.st.list; 
      if (dataList.filter( data => data.checked).length > 0) {
        // as long as the user select one record , allow the user to 
        // click the confirm button on the modal
        
        this.queryModal.updateConfig({ 
          nzOkDisabled: false,
        })
      }
    }

  }

  showOrderDetails(order: Order): void {
    // When we expand the details for the order, load the picks and short allocation from the server
    // if (this.expandSet.has(order.id!)) {
      this.showPicks(order);
      this.showShortAllocations(order);
      this.showPickedInventory(order);
    // }
  }
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
 
  isAnyRecordChecked(): boolean { 
    if (this.st == null || this.st.list == null) {
      return false;
    }
    const dataList: STData[] = this.st.list; 

    return dataList.some(record =>  record.checked  );
  }

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAllOrders = []; 
    this.createQueryForm();

    // show the model
    this.queryModal = this.modalService.create({
      nzTitle: tplQueryModalTitle,
      nzContent: tplQueryModalContent,
      nzFooter: tplQueryModalFooter, 
      nzWidth: 1000,
    });
  }
  createQueryForm(): void {
    console.log(`open order query with customer ${this.customerName}`)
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      orderStatus: [null],
      orderCategory: [null],
      customer: [this.customerName],
    }); 
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        this.getSelectedOrder()[0].number,
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();
  }

  
  getSelectedOrder(): Order[] {
    
    const dataList: STData[] = this.st.list;
    let selectedOrder: Order[] = [];
    dataList.filter(record => record.checked === true)
    .forEach(record => {
      selectedOrder = [...selectedOrder, 
          ...this.listOfAllOrders.filter(order => order.number === record["number"])];
    });
    return selectedOrder;

  }
  loadValidCustomers() {

    this.customerService.loadCustomers().subscribe({
      next: (customerRes) => {
        this.validCustomers = customerRes;
        this.filterValidCustomers = customerRes;
      }
    });
  }
   

  onCustomerInputChange(e: Event): void {
    const value = (e.target as HTMLInputElement).value;
    if (value.length === 0) {
      // the user didn't input any value in the customer filter, let's
      // show all the valid customer
      this.filterValidCustomers = this.validCustomers;
    }
    else {
      // the user input something, furture filter out the result by
      // the input value, from the customer's name or description
      this.filterValidCustomers = this.validCustomers.filter(
        customer => customer.name.toLowerCase().indexOf(value.toLowerCase()) >= 0 || 
            customer.description.toLowerCase().indexOf(value.toLowerCase()) >= 0
      );
    } 
  }

}
