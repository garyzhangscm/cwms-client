import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';

import { TrailerAppointment } from '../../transportation/models/trailer-appointment';
import { TrailerAppointmentStatus } from '../../transportation/models/trailer-appointment-status.enum';
import { TrailerAppointmentType } from '../../transportation/models/trailer-appointment-type.enum';
import { TrailerAppointmentService } from '../../transportation/services/trailer-appointment.service';
import { Shipment } from '../models/shipment';
import { StopService } from '../services/stop.service';

@Component({
  selector: 'app-outbound-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.less'],
})
export class OutboundLoadComponent implements OnInit {

  
  trailerAppointmentStatus = TrailerAppointmentStatus; 
  searchForm!: FormGroup;
  searchResult = '';
  listOfAllTrailerAppointments: TrailerAppointment[] = [];
  isSpinning = false;
  // shipments map
  // key: trailer appointment id
  // value: list of the shipment in the trailer appointment
  shipmentsMap = new Map<number, Shipment[]>();
   

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
    }, 
   
  ];

  constructor(private http: _HttpClient, 
    private trailerAppointmentService: TrailerAppointmentService,
    private titleService: TitleService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private stopService: StopService,
    private fb: FormBuilder,) { }

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
    })
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
}
