import { formatDate } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Order } from '../../outbound/models/order';
import { OrderStatus } from '../../outbound/models/order-status.enum';
import { OrderService } from '../../outbound/services/order.service';
import { PickService } from '../../outbound/services/pick.service';
import { ShipmentLineService } from '../../outbound/services/shipment-line.service';
import { LocalCacheService } from '../services/local-cache.service';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'app-util-order-query-popup',
    templateUrl: './order-query-popup.component.html',
    styleUrls: ['./order-query-popup.component.less'],
    standalone: false
})
export class UtilOrderQueryPopupComponent implements OnInit {
  scrollX = '100vw';
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
  loadingOrderDetailsRequest = 0;
  
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
    {
      title: this.i18n.fanyi("shipToCustomer"),
      // renderTitle: 'customTitle',
      render: 'shipToCustomerColumn',
      iif: () => this.isChoose('shipToCustomer'), width: 150
    },
    {
      title: this.i18n.fanyi("order.billToCustomer"),
      // renderTitle: 'customTitle',
      render: 'billToCustomerColumn',
      iif: () => this.isChoose('billToCustomer'), width: 150
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

  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';


  // Table data for display
  listOfAllOrders: Order[] = []; 
  
  orderStatuses = OrderStatus;

  // list of checked checkbox
  setOfCheckedId = new Set<number>();

  // eslint-disable-next-line @angular-eslint/prefer-output-readonly
  @Output() recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private orderService: OrderService, 
    private modalService: NzModalService,
    private utilService: UtilService,
    private localCacheService: LocalCacheService,
    private shipmentLineService: ShipmentLineService,
    private pickService: PickService,
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {

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
      this.searchForm.value.orderStatus).subscribe(
      orderRes => {
  
        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: orderRes.length,
        });
         
        this.listOfAllOrders =  orderRes;
      },
      () => this.searchResult = '' 
    );
  }
 

  isAnyRecordChecked(): boolean {
    const dataList: STData[] = this.st.list;
    return dataList.some(record => record.checked === true);
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
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      item: [null],
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

  
  // we will load the client / supplier / item information 
  // asyncronized
  async refreshDetailInformations(orders: Order[]) { 
    let index = 0;
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
    // console.log(`refresh the table`);  
    this.st.reload();
  }
  
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  
  refreshDetailInformation(order: Order) {
  
      this.loadClient(order); 
     
      this.loadCustomer(order); 
      
      this.loadStageLocation(order); 
       

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

}
