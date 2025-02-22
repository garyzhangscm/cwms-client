import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service'; 
import { Shipment } from '../models/shipment';
import { Stop } from '../models/stop';
import { StopStatus } from '../models/stop-status.enum';
import { StopService } from '../services/stop.service';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
    selector: 'app-outbound-stop',
    templateUrl: './stop.component.html',
    styleUrls: ['./stop.component.less'],
    standalone: false
})
export class OutboundStopComponent implements OnInit {

   
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;
  searchResult = '';
  listOfAllStops: Stop[] = [];
  isSpinning = false; 
   

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("number"), index: 'number'  },   
    { title: this.i18n.fanyi("sequence"), index: 'sequence'  },  
    { title: this.i18n.fanyi("status"), index: 'status'  },  
    { title: this.i18n.fanyi("contactor.firstname"), index: 'contactorFirstname'  },  
    { title: this.i18n.fanyi("contactor.lastname"), index: 'contactorLastname'  },  
    { title: this.i18n.fanyi("country"), index: 'country'  },  
    { title: this.i18n.fanyi("state"), index: 'state'  },  
    { title: this.i18n.fanyi("county"), index: 'county'  },  
    { title: this.i18n.fanyi("city"), index: 'city'  },  
    { title: this.i18n.fanyi("address.line1"), index: 'address.line1'  },  
    { title: this.i18n.fanyi("address.line2"), index: 'address.line2'  },  
    { title: this.i18n.fanyi("postcode"), index: 'postcode'  },  
         
    {
      title: this.i18n.fanyi("action"), fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];

  displayOnly = false;
  constructor(private http: _HttpClient, 
    private stopService: StopService,
    private titleService: TitleService, 
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute, 
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/outbound/stop").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                 
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.stop'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null], 
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
    this.listOfAllStops = []; 

  }
  search() {
    this.isSpinning = true;
     

    this.stopService.getStops(
      this.searchForm.value.number.value,   
    ).subscribe(
      {
        next: (stopRes) => {
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: stopRes.length,
          });
          
          this.listOfAllStops = stopRes;  
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      }
    )

  }

  isStopReadForComplete(stop: Stop): boolean {
    return stop.status === StopStatus.INPROCESS || 
    stop.status === StopStatus.PLANNED 
  }
  isStopReadForAllocate(stop: Stop): boolean {
    return stop.status === StopStatus.INPROCESS || 
    stop.status === StopStatus.PLANNED 
  }
  
  allocateStop(stop: Stop) {

    this.isSpinning = true;
    this.stopService.allocateStop(
      stop.id!  
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

  completeStop(stop: Stop) {

    this.isSpinning = true;
    this.stopService.completeStop(
      stop.id!  
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

  
  stopTableChanged(event: STChange) : void { 
    console.log(`stopTableChanged, event.type: ${event.type} `);
    if (event.type === 'expand' && event.expand.expand === true) {
      
       console.log(`start to call showTrailerAppointmentDetails`);
      this.showStopDetails(event.expand);
    }

  }
  
  showStopDetails(stop: Stop): void {  

    this.isSpinning = true;

    stop.shipments = this.calculateQuantities(stop.shipments); 
    this.isSpinning = false;
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
