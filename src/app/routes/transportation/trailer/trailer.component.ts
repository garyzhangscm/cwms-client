import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Order } from '../../outbound/models/order';
import { Shipment } from '../../outbound/models/shipment';
import { Stop } from '../../outbound/models/stop';
import { OrderService } from '../../outbound/services/order.service';
import { StopService } from '../../outbound/services/stop.service';
import { Trailer } from '../models/trailer';
import { TrailerService } from '../services/trailer.service';

@Component({
    selector: 'app-common-trailer',
    templateUrl: './trailer.component.html',
    styleUrls: ['./trailer.component.less'],
    standalone: false
})
export class CommonTrailerComponent implements OnInit {
  isSpinning = false;
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("size"),  index: 'size' , 
    iif: () => this.isChoose('size')  }, 
    {
      title: this.i18n.fanyi('action'),
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
  
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("size"), value: 'size', checked: true },      
    
  ];

  
  @ViewChild('stStops', { static: false })
  stStops!: STComponent;
  stopColumns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  render: 'numberColumn',   },  
    { title: this.i18n.fanyi("sequence"),  index: 'sequence' ,   }, 
    { title: this.i18n.fanyi("address"),  render: 'addressColumn' }, 
    { title: this.i18n.fanyi("shipmentCount"),  index: 'shipmentCount' ,   }, 
    { title: this.i18n.fanyi("orderCount"),  index: 'orderCount' ,   }, 
    {
      title: this.i18n.fanyi('action'), fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 

 
  @ViewChild('stOrders', { static: false })
  stOrders!: STComponent;
  orderColumns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  render: 'numberColumn',   },  
    { title: this.i18n.fanyi("address"),  render: 'addressColumn',   },  
    { title: this.i18n.fanyi("inProcess"),  render: 'inProcessColumn' }, 
    { title: this.i18n.fanyi("shipped"),  render: 'shippedColumn' }, 
    {
      title: this.i18n.fanyi('action'), fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
 
  @ViewChild('stShipments', { static: false })
  stShipments!: STComponent;
  shipmentColumns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,   },  
    { title: this.i18n.fanyi("address"),  render: 'addressColumn' }, 
    { title: this.i18n.fanyi("inProcess"),  render: 'inProcessColumn' }, 
    { title: this.i18n.fanyi("staged"),  render: 'stagedColumn' }, 
    { title: this.i18n.fanyi("loaded"),  render: 'loadedColumn' }, 
    { title: this.i18n.fanyi("shipped"),  render: 'shippedColumn' }, 
    {
      title: this.i18n.fanyi('action'), fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 


  searchForm!: UntypedFormGroup;
  trailers: Trailer[] = [];
  searchResult = "";
  mapOfStops: { [key: string]: Stop[] } = {};
  mapOfOrders: { [key: string]: Order[] } = {};
  mapOfShipments: { [key: string]: Shipment[] } = {};

  displayOnly = false;
  constructor(
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private trailerService: TrailerService,
    private messageService: NzMessageService, 
    private stopService: StopService,
    private orderService: OrderService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/transportation/trailer").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                  
    }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null], 
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params['number']) { 
        this.searchForm!.value.number.setValue(params['number']);
        this.search();
      } 
    });

  }
  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }
    
  resetForm(): void {
    this.searchForm.reset();
    this.trailers = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.trailerService
      .getTrailers(this.searchForm.value.number)
      .subscribe({

        next: (containerRes) => {
          this.trailers = containerRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: containerRes.length
          });
 

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   

  removeTrailer(trailer : Trailer) {
    
    this.isSpinning = true;
    this.trailerService.removeTrailer(trailer).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
         
        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }
 
  
  trailerTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showTrailerDetails(event.expand);
    }

  } 

  showTrailerDetails(trailer: Trailer): void {  
    if (trailer.currentAppointment) {
      this.stopService.getStops(undefined, trailer.currentAppointment.id).subscribe({
        next: (stopsRes) => {
          // calculate the number of orders and shipments in the stop
          this.mapOfStops[trailer.id!] = [];
          this.mapOfShipments[trailer.id!] = [];
          stopsRes.forEach(
            stop => {
              // load the shipment information
              this.mapOfShipments[trailer.id!] = [...this.mapOfShipments[trailer.id!], 
                ...stop.shipments];

              stop.shipmentCount = stop.shipments.length;

              // load the order information
              this.orderService.getOrdersByTrailerAppointment(trailer.currentAppointment!.id!).subscribe({
                next: (ordersRes) => {
                  this.calculateOrdersQuantities(ordersRes);
                  this.mapOfOrders[trailer.id!] = ordersRes;
                  stop.orderCount = ordersRes.length;

                }
              }) 
            }
          )
          this.mapOfStops[trailer.id!] = stopsRes;

          this.calculateShipmentsQuantities(this.mapOfShipments[trailer.id!]);
        }
      })
    }
     
  }
  removeStopFromTrailerAppointment(stop: Stop) {
    console.log(`we will remove stop ${stop.sequence} from the trailer appointment`)
  }

  
  calculateShipmentsQuantities(shipments: Shipment[]): void { 
    shipments.forEach(shipment => {
      
        this.calculateShipmentQuantities(shipment)
    })
  }
  calculateShipmentQuantities(shipment: Shipment): void { 
      const existingItemIds = new Set();

      shipment.totalLineCount = shipment.shipmentLines.length;
      shipment.totalItemCount = 0;

      shipment.totalQuantity = 0;
      shipment.totalOpenQuantity = 0;
      shipment.totalInprocessQuantity = 0;
      shipment.totalStagedQuantity = 0;
      shipment.totalLoadedQuantity = 0;
      shipment.totalShippedQuantity = 0;

      shipment.shipmentLines.forEach(shipmentLine => {
        shipment.totalQuantity! += shipmentLine.quantity;
        shipment.totalOpenQuantity! += shipmentLine.openQuantity;
        shipment.totalInprocessQuantity! += shipmentLine.inprocessQuantity;
        shipment.totalStagedQuantity! += shipmentLine.stagedQuantity;
        shipment.totalLoadedQuantity! += shipmentLine.loadedQuantity;
        shipment.totalShippedQuantity! += shipmentLine.shippedQuantity;
        if (!existingItemIds.has(shipmentLine.orderLine.itemId)) {
          existingItemIds.add(shipmentLine.orderLine.itemId);
        }
      });

      shipment.totalItemCount = existingItemIds.size; 
  }
  
  calculateOrdersQuantities(orders: Order[]) {

    orders.forEach(
      order => this.calculateOrderQuantities(order)
    );
  }
  calculateOrderQuantities(order: Order) {
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
     
    console.log(`order: ${order.number}, totalExpectedQuantity: ${order.totalExpectedQuantity},
    totalInprocessQuantity: ${order.totalInprocessQuantity}, totalShippedQuantity: ${order.totalShippedQuantity},`)

  }


  removeOrderFromTrailerAppointment(order: Order) {

  }
  removeShipmentFromTrailerAppointment(shipment: Shipment) {
    
  }
}
