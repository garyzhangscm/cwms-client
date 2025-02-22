import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';  
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { User } from '../../auth/models/user';
import { UserService } from '../../auth/services/user.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { TrailerAppointmentStatus } from '../../transportation/models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../../transportation/models/trailer-appointment-type.enum';
import { TrailerAppointmentService } from '../../transportation/services/trailer-appointment.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { BillOfMaterial } from '../../work-order/models/bill-of-material';
import { BillOfMaterialService } from '../../work-order/services/bill-of-material.service';
import { WorkTaskService } from '../../work-task/services/work-task.service';
import { Order } from '../models/order';
import { PickGroupType } from '../models/pick-group-type.enum';
import { PickStatus } from '../models/pick-status.enum';
import { PickType } from '../models/pick-type.enum';
import { PickWork } from '../models/pick-work';
import { Shipment } from '../models/shipment';
import { ShortAllocation } from '../models/short-allocation';
import { ShortAllocationStatus } from '../models/short-allocation-status.enum';
import { BulkPickService } from '../services/bulk-pick.service';
import { OrderService } from '../services/order.service';
import { PickListService } from '../services/pick-list.service';
import { PickService } from '../services/pick.service';
import { ShortAllocationService } from '../services/short-allocation.service';
import { StopService } from '../services/stop.service';

@Component({
    selector: 'app-outbound-load',
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.less'],
    standalone: false
})
export class OutboundLoadComponent implements OnInit {

  
  trailerAppointmentStatus = TrailerAppointmentStatus; 
  trailerAppointmentStatusKeys = Object.keys(this.trailerAppointmentStatus);
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
  /**
   * 
   * 
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;
   */
  
  createWorkOrderModal!: NzModalRef;
  createWorkOrderForm!: UntypedFormGroup;
  
  // show the BOM details when the user choose
  // a bom to create work order for short allocation
  displayBom: BillOfMaterial | undefined;

  pickTableExpandSet = new Set<number>();
  pickStatuses = PickStatus;
  currentTrailerAppointment?: TrailerAppointment;
  currentPick?: PickWork;
  listOfAllAssignableUsers: User[] = []; 
  selectedUserId?: number;
  queryUserModal!: NzModalRef;
  searchUserForm!: UntypedFormGroup;
  searching = false;
  pickGroupTypes = PickGroupType;
   
  trailerAppointmentStatusEnum = TrailerAppointmentStatus;

  userTablecolumns: STColumn[] = [
    { title: '', index: 'id', type: 'radio', width: 70 },
    { title: this.i18n.fanyi('username'),  index: 'username' }, 
    { title: this.i18n.fanyi('firstname'),  index: 'firstname' }, 
    { title: this.i18n.fanyi('lastname'),  index: 'lastname' }, 
  ];

   
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
    private printingService: PrintingService,
    private activatedRoute: ActivatedRoute,
    private stopService: StopService,
    private pickService: PickService,
    private workTaskService: WorkTaskService,
    private router: Router,
    private modalService: NzModalService,
    private shortAllocationService: ShortAllocationService,
    private billOfMaterialService: BillOfMaterialService,
    private bulkPickService: BulkPickService,
    private userService: UserService,
    private orderService: OrderService,
    private localCacheService: LocalCacheService,
    private pickListService: PickListService,
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
      if (params['number']) {
        this.searchForm.value.number.setValue(params['number']);
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
    // this.checked = false;
    
    let startTime : Date = this.searchForm.value.dateTimeRanger.value ? 
        this.searchForm.value.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.dateTimeRanger.value ? 
        this.searchForm.value.dateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.date.value;

    this.trailerAppointmentService.getTrailerAppointments(
      this.searchForm.value.number.value, 
      TrailerAppointmentType.SHIPPING,
      this.searchForm.value.status.value,
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
    /**
     * 
    this.pickService.getPicksByLoad(trailerAppointment.id!).subscribe(pickRes => {
      this.mapOfPicks[trailerAppointment.id!] = [...pickRes];
    });
    
     * 
     */
    this.pickService.getPicksByLoad(trailerAppointment.id!).subscribe({
      next: (pickRes) => {
        // get all the single pick and add it to the result
        // this.mapOfPicks[wave.id!] = pickRes.filter(pick => this.pickService.isSinglePick(pick));
        // get all the bulk pick
        // console.log(`start to setup ${pickRes.length}`);
        // group the picks into 
        // 1. single pick
        // 2. bulk pick
        // 3. list pick
        this.pickService.setupPicksForDisplay(pickRes).then(
          pickWorks => { 
            this.mapOfPicks[trailerAppointment.id!] = pickWorks;

            // setup the work task related information
            // this.setupWorkTaskInformationForPicks(this.mapOfPicks[wave.id!]);
          }
        );


      }
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
    // console.log(`trailerAppointmentTableChanged, event.type: ${event.type} `);
    if (event.type === 'expand' && event.expand.expand === true) {
      
      // console.log(`start to call showTrailerAppointmentDetails`);
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
        // console.log(`add ${shipments.length} shipment to trailer ${trailerAppointment.id!}`);
        
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

  /**
   *  
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
  **/
  
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
  
  getSelectedPicks(trailerAppointment: TrailerAppointment): PickWork[] {
    let selectedPicks: PickWork[] = [];
    
    const dataList: STData[] = this.stPick.list; 
    dataList
      .filter( data => data.checked)
      .forEach(
        data => {
          // get the selected billing request and added it to the 
          // selectedBillingRequests
          selectedPicks = [...selectedPicks,
              ...this.mapOfPicks[trailerAppointment.id!].filter(
                pick => pick.number == data["number"]
              )
          ]

        }
      );
    return selectedPicks;
  }
  cancelSelectedPick(trailerAppointment: TrailerAppointment, errorLocation: boolean, generateCycleCount: boolean): void {
    this.isSpinning = true;
    const picks :PickWork[] = [];
    this.getSelectedPicks(trailerAppointment).forEach(pick => { 
        picks.push(pick);
    });
 
    if (picks.length ===0) {
        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning = false;
        return;
    }
    
    // split picks based on the type
    const bulkPicks :PickWork[] = [];
    const pickLists :PickWork[] = [];
    const singlePicks :PickWork[] = [];

      picks.forEach(
        pick => {
          if (pick.pickGroupType === PickGroupType.BULK_PICK) {
            bulkPicks.push(pick);
          }
          else if (pick.pickGroupType === PickGroupType.LIST_PICK) {
            pickLists.push(pick);
          }
          else {
            singlePicks.push(pick);
          }
        }
      )

      this.pickService.cancelPicks(singlePicks, errorLocation, generateCycleCount).subscribe({
        next: () => { 
          this.bulkPickService.cancelBulkPickInBatch(bulkPicks, errorLocation, generateCycleCount).subscribe({
            next: () => {              
              this.pickListService.cancelPickListInBatch(pickLists, errorLocation, generateCycleCount).subscribe({
                next: () => {
                  this.messageService.success(this.i18n.fanyi("message.action.success")); 
                  this.isSpinning = false;
                  this.search();
                }, 
                error: () => {                  
                  this.messageService.error(this.i18n.fanyi("message.action.fail"));
                  this.isSpinning = false;
                }
              }); 
            }, 
            error: () => {
              
              this.messageService.error(this.i18n.fanyi("message.action.fail"));
              this.isSpinning = false;
            }
          }) ;
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
                    this.createWorkOrderForm.value.bom.value,
                    this.createWorkOrderForm.value.workOrderNumber.value,
                    this.createWorkOrderForm.value.workOrderQuantity.value,
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
      this.createWorkOrderForm!.value.bom.setValue(this.availableBOM[0].id);
      this.displayBom = this.availableBOM[0];
    }
  }
  workOrderNumberChanged(workOrderNumber: string) {
    
    this.createWorkOrderForm.value.workOrderNumber.setValue(workOrderNumber);
  }
  
  onPickTableExpandChange(id: number, pick: PickWork,checked: boolean): void {
    if (checked) {
      this.pickTableExpandSet.add(id); 
    } else {
      this.pickTableExpandSet.delete(id);
    }
  } 
  
  releasePick(trailerAppointment: TrailerAppointment, pick: PickWork) {
    this.isSpinning = true;
    // console.log(`start to release pick \n ${JSON.stringify(pick)}`);

    if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        this.bulkPickService.releasePick(pick.id).subscribe({
          next: () => { 
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search(); 
          }, 
          error: () => this.isSpinning = false
        })
    }
    else if (pick.pickGroupType == null) {
      this.pickService.releasePick(pick.id).subscribe({
        next: () => { 
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search(); 
        }, 
        error: () => this.isSpinning = false
      })
  }
  }
  
  openUserQueryModal(
    trailerAppointment: TrailerAppointment,
    pick: PickWork, 
    tplAssignUserModalTitle: TemplateRef<{}>,
    tplAssignUserModalContent: TemplateRef<{}>,
    tplAssignUserModalFooter: TemplateRef<{}>,
  ): void {
 
    this.currentTrailerAppointment = trailerAppointment;
    this.currentPick = pick;

    this.listOfAllAssignableUsers = []; 

    this.selectedUserId = undefined;

    this.createQueryForm();

    // show the model
    this.queryUserModal = this.modalService.create({
      nzTitle: tplAssignUserModalTitle,
      nzContent: tplAssignUserModalContent,
      nzFooter: tplAssignUserModalFooter,

      nzWidth: 1000,
    });

  }
  
  searchUser(): void {
    this.searching = true;
    this.selectedUserId = undefined;
    if (this.currentPick?.workTaskId == null) {
      // if we can't get the current work task 
      // return an empty user result set
      this.listOfAllAssignableUsers = [];
      return;
    }
    this.userService
      .getUsers( 
        this.searchForm.value.username, 
        undefined,
        undefined,
        this.searchForm.value.firstname,
        this.searchForm.value.lastname,
        this.currentPick.workTaskId
      )
      .subscribe({
        next: (userRes) => {

          this.listOfAllAssignableUsers = userRes; 

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: userRes.length,
          });
        }, 
        error: () => {
          this.searching = false;
          this.searchResult = '';
        },
      });
  } 

 
  createQueryForm(): void {
    // initiate the search form
    this.searchUserForm = this.fb.group({ 
      username: [null], 
      firstname: [null], 
      lastname: [null],
    });
 
  }
  closeUserQueryModal(): void {
    this.queryUserModal.destroy();
  }
  returnUserResult(): void {
    // get the selected record
    if (this.isAnyUserRecordChecked()) {
      this.assignUser(this.currentTrailerAppointment!, this.currentPick!, this.selectedUserId);
    } else {
      console.log(`no user is selected, do nothing`)
    }
    this.queryUserModal.destroy();

  } 
  assignUser(trailerAppointment: TrailerAppointment, pick: PickWork, userId?: number) {
    // console.log(`start to assign user with id ${userId}`);
    if (userId == null) {
    //  console.log(`no user is selected, do nothing`)
    }
    else {
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to assign user to bulk pick`);
        this.bulkPickService.assignUser(pick.id, userId).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to assign user to pick`);
        this.pickService.assignUser(pick.id, userId).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
    }
  }
  unassignUser(trailerAppointment: TrailerAppointment, pick: PickWork) { 
      this.isSpinning = true;
      if (pick.pickGroupType == PickGroupType.BULK_PICK) {
        // console.log(`start to unassign user to bulk pick`);
        this.bulkPickService.unassignUser(pick.id).subscribe({
          next: (bulkPick) => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      }
      else if (pick.pickGroupType == null) {
        // console.log(`start to unassign user to pick`);
        this.pickService.unassignUser(pick.id).subscribe({
          next: () => {
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            // refresh the picked inventory
            this.search();  
          }, 
          error: () => this.isSpinning = false
        })
      } 
  }
  unacknowledgeWorkTask(trailerAppointment: TrailerAppointment, workTaskId: number) {  
      this.isSpinning = true; 
      this.workTaskService.unacknowledgeWorkTask(workTaskId, false).subscribe({
        next: () => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          // refresh the picked inventory
          this.search();  
        }, 
        error: () => this.isSpinning = false
      }) ;
  }


  change(ret: STChange): void {
    // console.log('change', ret);
    if (ret.type == 'radio') {
      this.selectedUserId = undefined;
      if (ret.radio != null && ret.radio!.id != null) {
        // console.log(`chosen user ${ret.radio!.id} / ${ret.radio!.username}`);
        this.selectedUserId = ret.radio!.id;
      }
    }
  }
  isAnyUserRecordChecked() {
    return  this.selectedUserId != undefined;;
  }

  
  @ViewChild('stPick', { static: false })
  stPick!: STComponent;
  pickColumns: STColumn[] = [ 
    { title: '', index: 'number', type: 'checkbox' },

    { title: this.i18n.fanyi("pick.number"), index: 'number' , width: 150, },   
    { title: this.i18n.fanyi("status"), render: 'statusColumn', width: 110,  },   
    { title: this.i18n.fanyi("type"), render: 'typeColumn', width: 110,  },  
    { title: this.i18n.fanyi("order.number"), index: 'orderNumber' , width: 150, },   
    { title: this.i18n.fanyi("work-task.number"), render: 'workTaskColumn' , width: 210, },  
    // { title: this.i18n.fanyi("assign"), render: 'assignColumn'  },  
    // { title: this.i18n.fanyi("currentUser"), index: 'workTask.currentUser.username'  },  
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name'  },  
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name'  },     
    { title: this.i18n.fanyi("item"), index: 'item.name'  },   
    { title: this.i18n.fanyi("item.description"), index: 'item.description'  },   
    { title: this.i18n.fanyi("pick.quantity"), index: 'quantity'  },   
    { title: this.i18n.fanyi("pick.pickedQuantity"), index: 'pickedQuantity'  },    
    {
      title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];

  @ViewChild('stInnerPick', { static: false })
  stInnerPick!: STComponent;
  innerPickColumns: STColumn[] = [  
    { title: this.i18n.fanyi("pick.number"), index: 'number'  },   
    { title: this.i18n.fanyi("status"), render: 'innerPickStatusColumn',  },   
    { title: this.i18n.fanyi("order.number"), index: 'orderNumber'  },   
    { title: this.i18n.fanyi("sourceLocation"), index: 'sourceLocation.name'  },  
    { title: this.i18n.fanyi("destinationLocation"), index: 'destinationLocation.name'  },     
    { title: this.i18n.fanyi("item"), index: 'item.name'  },   
    { title: this.i18n.fanyi("item.description"), index: 'item.description'  },   
    { title: this.i18n.fanyi("pick.quantity"), index: 'quantity'  },   
    { title: this.i18n.fanyi("pick.pickedQuantity"), index: 'pickedQuantity'  },     
   
  ];

  
  printPickSheet(event: any, pickWork: PickWork) {

    if (pickWork.pickGroupType === PickGroupType.BULK_PICK) {
      
      this.printBulkPickSheet(event, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.SINGLE_PICK) {
      
      this.printSinglePickSheet(event, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.LIST_PICK) {
      
      this.printSinglePickSheet(event, pickWork);
    }
  }
  
  printBulkPickSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.bulkPickService.generateBulkPickSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Bulk Pick Sheet",
            printResult.fileName,
            ReportType.BULK_PICK_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }
  
  printSinglePickSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.pickService.generatePickSheet(
      pickWork.id.toString())
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Pick Sheet",
            printResult.fileName,
            ReportType.PICK_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }
  printPickListSheet(event: any, pickWork: PickWork) {

    this.isSpinning = true;
    this.pickListService.generatePickListSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.printingService.printFileByName(
            "Pick List Sheet",
            printResult.fileName,
            ReportType.PICK_LIST_SHEET,
            event.printerIndex,
            event.printerName,
            event.physicalCopyCount,
            PrintPageOrientation.Portrait,
            PrintPageSize.Letter,
            pickWork.number, 
            printResult, event.collated);
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("report.print.printed"));
          }, 
        error:  () => this.isSpinning = false
      });   
    
  }

  previewPickSheet(trailerAppointmentNumber: string, pickWork: PickWork): void {

    if (pickWork.pickGroupType === PickGroupType.BULK_PICK) {
      
      this.previewBulkPickSheet(trailerAppointmentNumber, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.SINGLE_PICK) {
      
      this.previewSinglePickSheet(trailerAppointmentNumber, pickWork);
    }
    else if (pickWork.pickGroupType === PickGroupType.LIST_PICK) {
      
      this.previewPickListSheet(trailerAppointmentNumber, pickWork);
    }
  }

  previewBulkPickSheet(trailerAppointmentNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.bulkPickService.generateBulkPickSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/load?number=${trailerAppointmentNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  previewSinglePickSheet(trailerAppointmentNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.pickService.generatePickSheet(
      pickWork.id.toString())
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/load?number=${trailerAppointmentNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  previewPickListSheet(trailerAppointmentNumber: string, pickWork: PickWork): void {

    this.isSpinning = true;
    this.pickListService.generatePickListSheet(
      pickWork.id)
      .subscribe({
        next: (printResult) => {  
          this.isSpinning = false;
          sessionStorage.setItem('report_previous_page', `/outbound/load?number=${trailerAppointmentNumber}`);
          this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`);

        }, 
        error:  () => this.isSpinning = false
      });   
  }
  
  printPickSheetInBatch(event: any, trailerAppointment: TrailerAppointment) {

    let picks : PickWork[] = this.getSelectedPicks(trailerAppointment);
    if (picks.length == 0) {
      return;
    }
    this.isSpinning = true;
    let count = 3;
    // group the picks according to the type
    const singlePickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.SINGLE_PICK)
        .map(pick => pick.id)
        .join(",");
    const listPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.LIST_PICK)
          .map(pick => pick.id)
          .join(",");
    const bulkPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.BULK_PICK)
          .map(pick => pick.id)
          .join(",");

    // LOOP through each group and print the report
    // we will generate and print the PDF file in batch  
    if (singlePickIds.length > 0) {

      this.pickService.generatePickSheet(
        singlePickIds)
        .subscribe({
          next: (printResult) => {  
            this.printingService.printFileByName(
              "Pick Sheet",
              printResult.fileName,
              ReportType.PICK_SHEET,
              event.printerIndex,
              event.printerName,
              event.physicalCopyCount,
              PrintPageOrientation.Portrait,
              PrintPageSize.Letter,
              singlePickIds, 
              printResult, event.collated);  

            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
          }, 
          error: () => this.isSpinning = false 
        });   
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
    if (listPickIds.length > 0) {

        this.pickListService.generatePickListSheetInBatch(
          listPickIds)
          .subscribe({
            next: (printResults) => {    
              printResults.forEach(printResult => {
                this.printingService.printFileByName(
                  "List Pick Sheet",
                  printResult.fileName,
                  ReportType.PICK_LIST_SHEET,
                  event.printerIndex,
                  event.printerName,
                  event.physicalCopyCount,
                  PrintPageOrientation.Portrait,
                  PrintPageSize.Letter,
                  listPickIds, 
                  printResult, event.collated);  
                
              });
              count--;
              if (count <= 0) {
                this.isSpinning = false;
              }
              
            }, 
            error: () => this.isSpinning = false   
          });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
    if (bulkPickIds.length > 0) {
  
        this.bulkPickService.generateBulkPickSheetInBatch(
          bulkPickIds)
          .subscribe({
            next: (printResults) => {    
              printResults.forEach(printResult => {
                
                this.printingService.printFileByName(
                  "Bulk Pick Sheet",
                  printResult.fileName,
                  ReportType.BULK_PICK_SHEET,
                  event.printerIndex,
                  event.printerName,
                  event.physicalCopyCount,
                  PrintPageOrientation.Portrait,
                  PrintPageSize.Letter,
                  bulkPickIds, 
                  printResult, event.collated);  
              });
              count--;
              if (count <= 0) {
                this.isSpinning = false;
              }
              
            }, 
            error: () => this.isSpinning = false 
          });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    
  }

  
  previewPickSheetInBatch(trailerAppointment: TrailerAppointment): void {
    let picks : PickWork[] = this.getSelectedPicks(trailerAppointment);
    console.log(`get ${picks.length} selected picks from trailer appointment ${trailerAppointment.number}`);
    if (picks.length == 0) {
      return;
    }
    this.isSpinning = true;
    let count = 3;
    // group the picks according to the type
    const singlePickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.SINGLE_PICK)
        .map(pick => pick.id)
        .join(",");
    const listPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.LIST_PICK)
          .map(pick => pick.id)
          .join(",");
    const bulkPickIds : string = 
        picks.filter(pick => pick.pickGroupType == PickGroupType.BULK_PICK)
          .map(pick => pick.id)
          .join(",");
    
    console.log(`singlePickIds: ${singlePickIds}  `);
    console.log(`listPickIds: ${listPickIds}  `);
    console.log(`bulkPickIds: ${bulkPickIds}  `);
    sessionStorage.setItem('report_previous_page', ``);       
    // LOOP through each group and print the report
    // we will generate and print the PDF file in batch  
    if (singlePickIds.length > 0) {

      this.pickService.generatePickSheet(
        singlePickIds)
        .subscribe({
          next: (printResult) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 
  
          }, 
          error: () => this.isSpinning = false  
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    if (listPickIds.length > 0) {

      this.pickListService.generatePickListSheetInBatch(
        listPickIds)
        .subscribe({
          next: (printResults) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            printResults.forEach(printResult => {
              window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 

            });
            
          },  
          error: () => this.isSpinning = false 
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }
    if (bulkPickIds.length > 0) {

      this.bulkPickService.generateBulkPickSheetInBatch(
        bulkPickIds)
        .subscribe({
          next: (printResults) => {    
            count--;
            if (count <= 0) {
              this.isSpinning = false;
            }
            printResults.forEach(printResult => {
              window.open(`/#/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.PORTRAIT}`, '_blank'); 

            });
            
          },  
          error: () => this.isSpinning = false 
        });    
    }
    else {
      count--;
      if (count <= 0) {
        this.isSpinning = false;
      }
    }

  }

}
