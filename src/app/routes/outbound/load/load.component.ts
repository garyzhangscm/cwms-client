import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { TrailerAppointmentStatus } from '../../transportation/models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../../transportation/models/trailer-appointment-type.enum';
import { TrailerAppointmentService } from '../../transportation/services/trailer-appointment.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { BillOfMaterial } from '../../work-order/models/bill-of-material';
import { BillOfMaterialService } from '../../work-order/services/bill-of-material.service';
import { Order } from '../models/order';
import { PickWork } from '../models/pick-work';
import { Shipment } from '../models/shipment';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { OrderService } from '../services/order.service';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';
import { StopService } from '../services/stop.service';

@Component({
  selector: 'app-outbound-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.less'],
})
export class OutboundLoadComponent implements OnInit {

  
  trailerAppointmentStatus = TrailerAppointmentStatus; 
  searchForm!: UntypedFormGroup;
  searchResult = '';
  listOfAllTrailerAppointments: TrailerAppointment[] = [];
  isSpinning = false;
  // shipments map
  // key: trailer appointment id
  // value: list of the shipment in the trailer appointment
  shipmentsMap = new Map<number, Shipment[]>();

  ordersMap = new Map<number, Order[]>();

  mapOfPicks: { [key: string]: PickWork[] } = {};
  mapOfShortAllocations: { [key: string]: ShortAllocation[] } = {};
  availableBOM: BillOfMaterial[] = [];

  // check box of the pick table
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
  
  createWorkOrderModal!: NzModalRef;
  createWorkOrderForm!: UntypedFormGroup;
  
  // show the BOM details when the user choose
  // a bom to create work order for short allocation
  displayBom: BillOfMaterial | undefined;

  
  trailerAppointmentStatusEnum = TrailerAppointmentStatus;
  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([ 
    ['file-upload', false], 
    ['cancel-single-pick', false], 
    ['confirm-multiple-pick', false], 
    ['cancel-multiple-pick', false], 
    ['allocate-short-allocation', false], 
    ['create-work-order', false], 
    ['cancel-short-allocation', false], 
    ['allocate-load', false], 
    ['complete-load', false], 
  ]);


  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("number"), index: 'number'  },   
    { title: this.i18n.fanyi("description"), index: 'description'  },   
    { title: this.i18n.fanyi("status"), index: 'status'  },  
    { title: this.i18n.fanyi("completedTime"), render: 'completedTimeColumn',},        
    {
      title: this.i18n.fanyi("action"), fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];

  displayOnly = false;
  constructor( 
    private trailerAppointmentService: TrailerAppointmentService,
    private titleService: TitleService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private stopService: StopService,
    private pickService: PickService,
    private router: Router,
    private modalService: NzModalService,
    private shortAllocationService: ShortAllocationService,
    private billOfMaterialService: BillOfMaterialService,
    private userService: UserService,
    private orderService: OrderService,
    private localCacheService: LocalCacheService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/outbound/load").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );            
       
      userService.getUserPermissionByWebPage("/outbound/load").subscribe({
        next: (userPermissionRes) => {
          userPermissionRes.forEach(
            userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
          )
        }
      });             
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.load'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      status: [null],
      dateTimeRanger: [null],
      date: [null],
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
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllTrailerAppointments = []; 

  }
  search() {
    this.isSpinning = true;
    
    let startTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.date.value;

    this.trailerAppointmentService.getTrailerAppointments(
      this.searchForm.controls.number.value, 
      TrailerAppointmentType.SHIPPING,
      this.searchForm.controls.status.value,
      startTime,  endTime, specificDate    
    ).subscribe(
      {
        next: (trailerApointmentRes) => {
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: trailerApointmentRes.length,
          });
          
          this.listOfAllTrailerAppointments = trailerApointmentRes;  
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      }
    )

  }

  isLoadReadForComplete(trailerAppointment: TrailerAppointment): boolean {
    return trailerAppointment.status === TrailerAppointmentStatus.INPROCESS || 
           trailerAppointment.status === TrailerAppointmentStatus.PLANNED 
  }
  isLoadReadForAllocate(trailerAppointment: TrailerAppointment): boolean {
    return trailerAppointment.status === TrailerAppointmentStatus.INPROCESS || 
           trailerAppointment.status === TrailerAppointmentStatus.PLANNED 
  }
  
  allocateLoad(trailerAppointment: TrailerAppointment) {

    this.isSpinning = true;
    this.trailerAppointmentService.allocateTrailerAppointment(
      trailerAppointment.id!  
    ).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      },
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    });
  }

  completeLoad(trailerAppointment: TrailerAppointment) {

    this.isSpinning = true;
    this.trailerAppointmentService.completeLoad(
      trailerAppointment.id!  
    ).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      },
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';
      },
    });
  }
  
  
  showPicks(trailerAppointment: TrailerAppointment): void {
    this.pickService.getPicksByLoad(trailerAppointment.id!).subscribe(pickRes => {
      this.mapOfPicks[trailerAppointment.id!] = [...pickRes];
    });
  }
  showShortAllocations(trailerAppointment: TrailerAppointment): void {
    this.shortAllocationService
      .getShortAllocationsByLoad(trailerAppointment.id!)
      .subscribe(shortAllocationRes => {
        this.mapOfShortAllocations[trailerAppointment.id!] = shortAllocationRes.filter(
          shortAllocation => shortAllocation.status != ShortAllocationStatus.CANCELLED
        )
      } );
  }
  
  trailerAppointmentTableChanged(event: STChange) : void { 
    console.log(`trailerAppointmentTableChanged, event.type: ${event.type} `);
    if (event.type === 'expand' && event.expand.expand === true) {
      
       console.log(`start to call showTrailerAppointmentDetails`);
      this.showTrailerAppointmentDetails(event.expand);
    }

  }
  
  showTrailerAppointmentDetails(trailerAppointment: TrailerAppointment): void {  

    this.isSpinning = true;
    this.stopService.getStops(undefined, trailerAppointment.id!).subscribe({
      next: (stopsRes) => {

        trailerAppointment.stops = stopsRes;

        // add the shipments from the stop, into the map
        // so that we can show them in the tab
        this.shipmentsMap.set(trailerAppointment.id!, []);
        let shipments: Shipment[] = [];
        stopsRes.forEach(stop => { 
          stop.shipments.forEach(
            shipment => {
              shipments = [...shipments, shipment];
            }
          )
        });
        shipments = this.calculateQuantities(shipments);
        console.log(`add ${shipments.length} shipment to trailer ${trailerAppointment.id!}`);
        
        this.shipmentsMap.set(trailerAppointment.id!, shipments);

        
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });

    this.loadOrders(trailerAppointment);

    
    this.showPicks(trailerAppointment);
    this.showShortAllocations(trailerAppointment);  
  }

  loadOrders(trailerAppointment: TrailerAppointment) {
    this.orderService.getOrdersByTrailerAppointment(trailerAppointment.id!).subscribe({
      next: (ordersRes) => {
        this.ordersMap.set(trailerAppointment.id!, this.calculateOrderQuantities(ordersRes)); 
        ordersRes.forEach(
          order => {

            this.refreshOrderDetailInformations(order);
          }
        )
      }
    })
  }
  
  
  refreshOrderDetailInformations(order: Order) {
  
    this.loadClient(order); 
   
    this.loadSupplier(order);

    this.loadCarrier(order);
    
    this.loadCustomer(order); 
       
  }
  
  loadClient(order: Order) {
     
    if (order.clientId && order.client == null) { 
      this.localCacheService.getClient(order.clientId).subscribe(
        {
          next: (res) => {
            order.client = res; 
          },  
        }
      );      
    } 
  }
  
  loadCarrier(order: Order) {
     
    if (order.carrierId && order.carrier == null) { 
      this.localCacheService.getCarrier(order.carrierId).subscribe(
        {
          next: (res) => {
            order.carrier = res; 
            // load the carrier service level as well
            if (order.carrierServiceLevelId) {
              order.carrierServiceLevel = res.carrierServiceLevels.find(service => service.id === order.carrierServiceLevelId)
            } 
          },  
        }
      );      
    }  
  }
  loadSupplier(order: Order) {
     
    if (order.supplierId && order.supplier == null) { 
      this.localCacheService.getSupplier(order.supplierId).subscribe(
        {
          next: (res) => {
            order.supplier = res;  
          },  
        }
      );      
    }  
  }
  loadCustomer(order: Order) {
     
    if (order.billToCustomerId && order.billToCustomer == null) { 
      this.localCacheService.getCustomer(order.billToCustomerId).subscribe(
        {
          next: (res) => {
            order.billToCustomer = res;  
          },  
        }
      );      
    } 
    
    if (order.shipToCustomerId && order.shipToCustomer == null) { 
      this.localCacheService.getCustomer(order.shipToCustomerId).subscribe(
        {
          next: (res) => {
            order.shipToCustomer = res; 
              
          },  
        }
      );      
    } 
  }
  
  calculateOrderQuantities(orders: Order[]): Order[] {
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

  
  onItemChecked(id: number, loadId: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus(loadId);
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }
  onAllChecked(value: boolean, loadId: number): void {
    this.mapOfPicks[loadId].filter(item => item.pickedQuantity < item.quantity).forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus(loadId);
  }
 

  refreshCheckedStatus(loadId: number): void {
    this.checked = this.mapOfPicks[loadId].every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.mapOfPicks[loadId].some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }
  
  cancelPick(pick: PickWork, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    this.pickService.cancelPick(pick, errorLocation, generateCycleCount).subscribe({

      next: () => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false; 
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }
  
  confirmPicks(trailerAppointment: TrailerAppointment): void {
    this.router.navigateByUrl(`/outbound/pick/confirm?type=load&id=${trailerAppointment.id}`);
  }
  
  cancelSelectedPick(trailerAppointment: TrailerAppointment, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    const picks :PickWork[] = [];
    this.mapOfPicks[trailerAppointment.id!]
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

  
  isShortAllocationAllocatable(shortAllocation: ShortAllocation): boolean {
    return shortAllocation.openQuantity > 0;
  }
  allocateShortAllocation(shortAllocation: ShortAllocation): void {
    
    this.isSpinning = true;
    this.shortAllocationService.allocateShortAllocation(shortAllocation).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the short allocation
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }

  cancelShortAllocation(shortAllocation: ShortAllocation): void {
    this.isSpinning = true;
    this.shortAllocationService.cancelShortAllocations([shortAllocation]).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        // refresh the short allocation
        this.search();
      }, 
      error: () => this.isSpinning = false
    });
     
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
  
}
