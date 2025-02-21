import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Order } from '../../outbound/models/order';
import { Shipment } from '../../outbound/models/shipment';
import { Stop } from '../../outbound/models/stop';
import { OrderService } from '../../outbound/services/order.service';
import { ShipmentService } from '../../outbound/services/shipment.service';
import { StopService } from '../../outbound/services/stop.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Trailer } from '../models/trailer';
import { TrailerAppointment } from '../models/trailer-appointment';
import { TrailerAppointmentStatus } from '../models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../models/trailer-appointment-type.enum';
import { TrailerService } from '../services/trailer.service';

@Component({
    selector: 'app-transportation-trailer-appointment-maintenance',
    templateUrl: './trailer-appointment-maintenance.component.html',
    styleUrls: ['./trailer-appointment-maintenance.component.less'],
    standalone: false
})
export class TransportationTrailerAppointmentMaintenanceComponent implements OnInit {

  currentAppointment?: TrailerAppointment;
  trailerAppointmentTypes = TrailerAppointmentType;
  currentTrailer!: Trailer;
  isSpinning = false;
  pageTitle = '';
  stepIndex = 0; 
  addApointmentModal!: NzModalRef;
  stops: Stop[] = [];
  shipments: Shipment[] = []; 
  orders: Order[] = []; 

  assignStopModal!: NzModalRef;
  openStops: Stop[] = [];
  assignShipmentModal!: NzModalRef;
  
  openShipmentSearchForm!: UntypedFormGroup; 
  openShipmentTableSearchResult = "";
  openShipments: Shipment[] = [];
  assignOrderModal!: NzModalRef;
  openShipmentSearching = false;

  
  openOrderSearchForm!: UntypedFormGroup; 
  openOrderTableSearchResult = "";
  openOrders: Order[] = [];
  newAppointment = true;
  openOrderSearching = false;


  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private modalService: NzModalService,
    private trailerService: TrailerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private stopService: StopService,
    private shipmentService: ShipmentService,
    private orderService: OrderService,
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('trailer.maintenance'));
    this.pageTitle = this.i18n.fanyi('trailer.maintenance');

    this.activatedRoute.queryParams.subscribe(params => {
      // if we passed in the trailer id, then get the 
      // current appointment assigned to this trailer
      if (params.id) {
        // Get the current appoint for the trailer
        this.trailerService.getTrailerCurrentAppointment(params.id)
          .subscribe({
            next: (trailerAppoitmentRes) => {
              if (trailerAppoitmentRes) {
                this.currentAppointment = trailerAppoitmentRes;                  
                this.newAppointment = false;
              }
              else {
                // there's no appointment for the trailer yet                
                this.newAppointment = true;
              }
              
            }
          });
       
          // load the trailer information as well
        this.trailerService.getTrailer(params.id)
          .subscribe({
            next: (trailerRes) => {
              this.currentTrailer = trailerRes;  
            }
          });
      } 
    });

  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm() {
    if (this.newAppointment) {
      this.isSpinning = true;
      this.trailerService.addTrailerAppointment(this.currentTrailer.id!, this.currentAppointment!)
          .subscribe({
            next: (trailerAppointmentRes) => {
              this.isSpinning = false;
              this.attachStopShipmentOrdersToTrailerAppointment(trailerAppointmentRes);
            }, 
            error: () => this.isSpinning = false
          })
    }
    else {
      
      this.attachStopShipmentOrdersToTrailerAppointment(this.currentAppointment!);
    }
  }
  cancelTrailerAppointment() {

    if (this.currentTrailer && this.currentAppointment) {
      this.isSpinning = true;
      this.trailerService.cancelTrailerAppointment(this.currentTrailer.id!, this.currentAppointment!.id!)
      .subscribe({
        next: () => {
          this.currentAppointment = undefined;
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"))
        }, 
        error: () => this.isSpinning = false
      })
    }

  }
  completeTrailerAppointment() {

    if (this.currentTrailer && this.currentAppointment) {
      this.isSpinning = true;
      this.trailerService.completeTrailerAppointment(this.currentTrailer.id!, this.currentAppointment!.id!)
      .subscribe({
        next: () => {
          this.currentAppointment = undefined;
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"))
        }, 
        error: () => this.isSpinning = false
      })
    }

  }

  attachStopShipmentOrdersToTrailerAppointment(trailerAppointment: TrailerAppointment) {

    this.isSpinning = true;
    
    // let's attach the stop first
    const stopIdList = this.stops.map(stop => stop.id).join(",");
    const shipmentIdList = this.shipments.map(shipment => shipment.id).join(",");
    const orderIdList = this.orders.map(order => order.id).join(",");

    this.trailerService.assignStopShipmentOrdersToTrailerAppointment(
      trailerAppointment.id!, stopIdList, shipmentIdList, orderIdList
    ).subscribe({
      next: () => { 
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning= false; 
          this.router.navigateByUrl(`/transportation/trailer?number=${this.currentTrailer.number}`);
        }, 500);
      }, 
      error: () => this.isSpinning = false
    })

  }
  
  showAddAppointmentModal( 
    tplAddAppointmentModalTitle: TemplateRef<{}>,
    tplAddAppointmentModalContent: TemplateRef<{}>,
  ): void {
    if (this.currentAppointment != null) {
      this.messageService.error("please refresh the page and remove current appointment from the trailer first");
      return;
    }
    // init the current appoint
    this.currentAppointment = {
      
      companyId: this.companyService.getCurrentCompany()!.id,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      number: "",
      description: "", 
      status: TrailerAppointmentStatus.PLANNED,
    } 

      // show the model
      this.addApointmentModal = this.modalService.create({
        nzTitle: tplAddAppointmentModalTitle,
        nzContent: tplAddAppointmentModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOnCancel: () => {
          this.currentAppointment = undefined;
          this.addApointmentModal.destroy(); 
        },
        nzOnOk: () => {
          if (this.currentAppointment?.number == null) {
            this.messageService.error("number is required");
            return false;
          }
          else if (this.currentAppointment?.type == null) {
            this.messageService.error("type is required");
            return false;
          }
          return true;
        },
        nzWidth: 1000,
      }); 
  }

  currentAppointmentNumberChanged(number: string) { 
    this.currentAppointment!.number = number;
  }
 
 
  // assigned stop
  @ViewChild('stopTable', { static: true })
  stopTable!: STComponent;
  stopTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("sequence"),  index: 'sequence' ,  },  


    { title: this.i18n.fanyi("contactor.firstname"),  index: 'contactorFirstname' ,   }, 
    
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'contactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'addressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'addressState' ,   }, 
    { title: this.i18n.fanyi("county"),  index: 'addressCounty' ,   }, 
    { title: this.i18n.fanyi("city"),  index: 'addressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'addressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'addressLine1' ,   }, 
    { title: this.i18n.fanyi("line2"),  index: 'addressLine2' ,   }, 
    { title: this.i18n.fanyi("postcode"),  index: 'addressPostcode' ,   }, 
 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => this.stepIndex === 0
    },
  ]; 

  // open stops that we can assign to current appointment
  @ViewChild('openStopTable', { static: true })
  openStopTable!: STComponent;
  openStopTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id', type: 'checkbox' },
    { title: this.i18n.fanyi("sequence"),  index: 'sequence' ,  },  
    { title: this.i18n.fanyi("contactor.firstname"),  index: 'contactorFirstname' ,   },     
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'contactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'addressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'addressState' ,   }, 
    { title: this.i18n.fanyi("county"),  index: 'addressCounty' ,   }, 
    { title: this.i18n.fanyi("city"),  index: 'addressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'addressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'addressLine1' ,   }, 
    { title: this.i18n.fanyi("line2"),  index: 'addressLine2' ,   }, 
    { title: this.i18n.fanyi("postcode"),  index: 'addressPostcode' ,   }, 
  ]; 

  deassignStop(stop: Stop) {
    
    this.stops = this.stops.filter(assignedStop => assignedStop.id != stop.id)
  }

  openStopTableChange(stChange: STChange) {
    // make sure the user only check one column
    console.log('change', stChange);
    if (stChange.type === 'checkbox') {

      const dataList: STData[] = this.openStopTable.list; 
      if (dataList.filter( data => data.checked).length > 0) {
        // as long as the user select one stop , allow the user to 
        // click the confirm button on the modal to assign the 
        // selected stops to the current trailer appointment
        
        this.assignStopModal.updateConfig({ 
          nzOkDisabled: false,
        })
      }
    }

  }
  
  showAssignStopModal(
    tplAssignStopModalTitle: TemplateRef<{}>,
    tplAssignStopModalContent: TemplateRef<{}>,) {

      // show the model
      this.assignStopModal = this.modalService.create({
        nzTitle: tplAssignStopModalTitle,
        nzContent: tplAssignStopModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOkDisabled: true,
        nzOnCancel: () => { 
          this.assignStopModal.destroy(); 
        },
        nzOnOk: () => {
          
        },
        nzWidth: 1000,
      });
      
    this.assignStopModal.afterOpen.subscribe(() => this.setupOpenStops()); 
  }

  setupOpenStops() {
    this.stopService.getOpenStops().subscribe({
      next: (stopRes) => {
        this.openStops = stopRes;
      }
    })

  }

  // open shipments that we can create stop automatically
  // and assign to current appointment
  @ViewChild('shipmentTable', { static: true })
  shipmentTable!: STComponent;
  shipmentTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,  width: 200,},  
    { title: this.i18n.fanyi("orderNumber"),  index: 'orderNumbers' ,   width: 200,},     
    { title: this.i18n.fanyi("stop.number"),  index: 'stopNumber' ,   },       
    { title: this.i18n.fanyi("stop.sequence"),  index: 'stopSequence' ,   width: 150,},     
    { title: this.i18n.fanyi("contactor.firstname"),  index: 'shipTocontactorFirstname' ,   },     
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'shipTocontactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'shipToAddressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'shipToAddressState' ,   width: 150,}, 
    { title: this.i18n.fanyi("county"),  index: 'shipToAddressCounty' ,   width: 200,}, 
    { title: this.i18n.fanyi("city"),  index: 'shipToAddressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'shipToAddressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'shipToAddressLine1' ,   width: 200,}, 
    { title: this.i18n.fanyi("line2"),  index: 'shipToAddressLine2' ,   width: 200,}, 
    { title: this.i18n.fanyi("postcode"),  index: 'shipToAddressPostcode' ,   width: 150,}, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 150, 
      render: 'actionColumn',
      iif: () => this.stepIndex === 0
    },
  ]; 

  
  @ViewChild('openShipmentTable', { static: false })
  openShipmentTable!: STComponent;
  openShipmentTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , type: "checkbox" },   
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },   
    { title: this.i18n.fanyi("orderNumber"),  index: 'orderNumbers' ,   },     
    { title: this.i18n.fanyi("contactor.firstname"),  index: 'shipTocontactorFirstname' ,   },     
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'shipTocontactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'shipToAddressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'shipToAddressState' ,   }, 
    { title: this.i18n.fanyi("county"),  index: 'shipToAddressCounty' ,   }, 
    { title: this.i18n.fanyi("city"),  index: 'shipToAddressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'shipToAddressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'shipToAddressLine1' ,   }, 
    { title: this.i18n.fanyi("line2"),  index: 'shipToAddressLine2' ,   }, 
    { title: this.i18n.fanyi("postcode"),  index: 'shipToAddressPostcode' ,   }, 
  ]; 

  resetopenShipmentForm(): void {
    this.openShipmentSearchForm.reset();
    this.openShipments = []; 
  }
  openShipmentSearch(): void {
    
    this.assignShipmentModal.updateConfig({ 
      nzOkDisabled: true,
      nzOkLoading: true
    });
    this.openShipmentSearching = true;
    this.shipmentService
      .getOpenShpimentsForStop(this.openShipmentSearchForm.value.number, this.openShipmentSearchForm.value.orderNumber)
      .subscribe({

        next: (shipmentRes) => {
          this.openShipments = shipmentRes;
          this.assignShipmentModal.updateConfig({ 
            nzOkDisabled: true,
            nzOkLoading: false
          });
          this.openShipmentSearching = false;

          this.openShipmentTableSearchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: shipmentRes.length
          });
 

        },
        error: () => {
          this.assignShipmentModal.updateConfig({ 
            nzOkDisabled: true,
            nzOkLoading: false
          });
          this.openShipmentSearching = false;
          this.openShipmentTableSearchResult = '';
        }
      });
      
  }   
  deassignShipmentFromStop(shipment: Shipment) {
    this.shipments = this.shipments.filter(assignedShipment => assignedShipment.id != shipment.id)
  }
 
  openShipmentTableChange(stChange: STChange) {
    // make sure the user only check one column
    console.log('change', stChange);
    if (stChange.type === 'checkbox') {

      const dataList: STData[] = this.openShipmentTable.list; 
      if (dataList.filter( data => data.checked).length > 0) {
        // as long as the user select one stop , allow the user to 
        // click the confirm button on the modal to assign the 
        // selected stops to the current trailer appointment
        
        this.assignShipmentModal.updateConfig({ 
          nzOkDisabled: false,
          nzOkLoading: false,
        })
      }
    }

  }
  
  showAssignShipmentModal(
    tplAssignShipmentModalTitle: TemplateRef<{}>,
    tplAssignShipmentModalContent: TemplateRef<{}>,) {
      // initiate the search form
      this.openShipmentSearchForm = this.fb.group({
        number: [null], 
        orderNumber: [null], 
      });
      this.openShipments = [];

      // show the model
      this.assignShipmentModal = this.modalService.create({
        nzTitle: tplAssignShipmentModalTitle,
        nzContent: tplAssignShipmentModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOkDisabled: true,
        nzOnCancel: () => { 
          this.assignShipmentModal.destroy(); 
        },
        nzOnOk: () => {
          this.assignShipment();
          
        },
        nzWidth: 1000,
      }); 
  }
 
  assignShipment() {
    
    const dataList: STData[] = this.openShipmentTable.list; 
    dataList.filter(data => data.checked).forEach(
      shipmentRow => { 
        // get the shipment
        this.openShipments.filter(shipment => shipment.id === shipmentRow["id"])
        .forEach(
          shipment => this.shipments = [...this.shipments, shipment]
        ) 
      }
    ) 
  }

  // open orders that we can create shipment and stop automatically
  // and assign to current appointment 
  @ViewChild('orderTable', { static: true })
  orderTable!: STComponent;
  orderTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },      
    { title: this.i18n.fanyi("shipment.number"),  index: 'shipmentNumber' ,   },     
    { title: this.i18n.fanyi("stop.number"),  index: 'stopNumber' ,   },    
    { title: this.i18n.fanyi("stop.sequence"),  index: 'stopSequence' ,   },      
    { title: this.i18n.fanyi("contactor.firstname"),  index: 'shipTocontactorFirstname' ,   },     
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'shipTocontactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'shipToAddressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'shipToAddressState' ,   }, 
    { title: this.i18n.fanyi("county"),  index: 'shipToAddressCounty' ,   }, 
    { title: this.i18n.fanyi("city"),  index: 'shipToAddressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'shipToAddressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'shipToAddressLine1' ,   }, 
    { title: this.i18n.fanyi("line2"),  index: 'shipToAddressLine2' ,   }, 
    { title: this.i18n.fanyi("postcode"),  index: 'shipToAddressPostcode' ,   }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => this.stepIndex === 0
    },
  ];  

  
  @ViewChild('openOrderTable', { static: false })
  openOrderTable!: STComponent;
  openOrderTablecolumns: STColumn[] = [
    { title: this.i18n.fanyi("id"),  index: 'id' , type: "checkbox" }, 
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },   
    { title: this.i18n.fanyi("contactor.firstname"),  index: 'shipTocontactorFirstname' ,   },     
    { title: this.i18n.fanyi("contactor.lastname"),  index: 'shipTocontactorLastname' ,   }, 
    { title: this.i18n.fanyi("country"),  index: 'shipToAddressCountry' ,   }, 
    { title: this.i18n.fanyi("state"),  index: 'shipToAddressState' ,   }, 
    { title: this.i18n.fanyi("county"),  index: 'shipToAddressCounty' ,   }, 
    { title: this.i18n.fanyi("city"),  index: 'shipToAddressCity' ,   }, 
    { title: this.i18n.fanyi("district"),  index: 'shipToAddressDistrict' ,   }, 
    { title: this.i18n.fanyi("line1"),  index: 'shipToAddressLine1' ,   }, 
    { title: this.i18n.fanyi("line2"),  index: 'shipToAddressLine2' ,   }, 
    { title: this.i18n.fanyi("postcode"),  index: 'shipToAddressPostcode' ,   }, 
  ]; 

  deassignOrderFromStop(order: Order) { 
    this.orders = this.orders.filter(assignedOrder => assignedOrder.id != order.id);
    
  }
  
  resetOpenOrderForm(): void {
    this.openOrderSearchForm.reset();
    this.openOrders = []; 
  }
  openOrderSearch(): void {
    
    this.assignOrderModal.updateConfig({ 
      nzOkDisabled: true,
      nzOkLoading: true
    });
    this.openOrderSearching = true;
    this.orderService
      .getOpenOrdersForStop(this.openOrderSearchForm.value.number)
      .subscribe({

        next: (orderRes) => {
          this.openOrders = orderRes;
          this.assignOrderModal.updateConfig({ 
            nzOkDisabled: true,
            nzOkLoading: false
          });
          this.openOrderSearching = false;

          this.openOrderTableSearchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: orderRes.length
          });
 

        },
        error: () => {
          this.assignOrderModal.updateConfig({ 
            nzOkDisabled: true,
            nzOkLoading: false
          });
          this.openOrderSearching = false;
          this.openOrderTableSearchResult = '';
        }
      });
      
  }   


  openOrderTableChange(stChange: STChange) {
    // make sure the user only check one column 
    if (stChange.type === 'checkbox') {
      const dataList: STData[] = this.openOrderTable.list;  
      if (dataList.filter( data => data.checked).length > 0) {
        // as long as the user select one stop , allow the user to 
        // click the confirm button on the modal to assign the 
        // selected stops to the current trailer appointment
        
        this.assignOrderModal.updateConfig({ 
          nzOkDisabled: false,
          nzOkLoading: false
        })
      }
    }

  }
  
  showAssignOrderModal(
    tplAssignOrderModalTitle: TemplateRef<{}>,
    tplAssignOrderModalContent: TemplateRef<{}>,) {

      // initiate the search form
      this.openOrderSearchForm = this.fb.group({
        number: [null],  
      });
      this.openOrders = [];
      // show the model
      this.assignOrderModal = this.modalService.create({
        nzTitle: tplAssignOrderModalTitle,
        nzContent: tplAssignOrderModalContent,
        nzOkText: this.i18n.fanyi('confirm'),
        nzCancelText: this.i18n.fanyi('cancel'),
        nzMaskClosable: false,
        nzOkLoading: true,
        nzOnCancel: () => { 
          this.assignOrderModal.destroy(); 
        },
        nzOnOk: () => {
          this.assignOrder();
        },
        nzWidth: 1000,
      });
       
  }
 
  
  assignOrder() {
    
    const dataList: STData[] = this.openOrderTable.list; 
    dataList.filter(data => data.checked).forEach(
      orderRow => { 
        // get the order
        this.openOrders.filter(order => order.id === orderRow["id"])
        .forEach(
          order => this.orders = [...this.orders, order]
        ) 
      }
    ) 
  }

}
