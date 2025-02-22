import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';  
import { LocalCacheService } from '../../util/services/local-cache.service';
import { OrderActivity } from '../models/order-activity';
import { OrderActivityService } from '../services/order-activity.service';

@Component({
    selector: 'app-outbound-order-activity',
    templateUrl: './order-activity.component.html',
    styleUrls: ['./order-activity.component.less'],
    standalone: false
})
export class OutboundOrderActivityComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  searchForm!: UntypedFormGroup;
 

  // Table data for display
  listOfAllOrderActivities: OrderActivity[] = []; 


  threePartyLogisticsFlag = false;
  availableClients: Client[] = [];

  isCollapse = false;
  isSpinning = false;
  searchResult= '';
  
  loadingOrderActivityDetailsRequest = 0;


  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private orderActivityService: OrderActivityService,  
    private clientService: ClientService,
    private localCacheService: LocalCacheService,
    private userService: UserService,
    private titleService: TitleService, 
  ) { 
    userService.isCurrentPageDisplayOnly("/outbound/order-activity").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                          
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.order-activity'));
    this.initSearchForm();

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
    this.listOfAllOrderActivities = []; 

  }
  search(): void { 
    this.isSpinning = true;
    this.searchResult = '';
    
    let startTime : Date = this.searchForm.value.activityDateTimeRanger ? 
        this.searchForm.value.activityDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.activityDateTimeRanger ? 
        this.searchForm.value.activityDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.activityDate;

    this.orderActivityService
      .getOrderActivities(
        startTime,
        endTime,
        specificDate,
        this.searchForm.value.username,
        this.searchForm.value.rfCode,
        this.searchForm.value.order,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        this.searchForm.value.client,
      )
      .subscribe(
        orderActivityRes => {
          this.listOfAllOrderActivities = orderActivityRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: orderActivityRes.length,
          });
          
          this.refreshDetailInformations(orderActivityRes);
        },
        () => { 
          this.listOfAllOrderActivities = []; 
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }
   // we will load the client  
  // asyncronized
  async refreshDetailInformations(orderActivities: OrderActivity[]) {  
    // const currentPageOrders = this.getCurrentPageOrders(); 
    let index = 0;
    this.loadingOrderActivityDetailsRequest = 0;
    while (index < orderActivities.length) {

      // we will need to make sure we are at max loading detail information
      // for 50 order activities at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time 
      
      
      while(this.loadingOrderActivityDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(orderActivities[index]);
      index++;
    } 
    while(this.loadingOrderActivityDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
    // refresh the table while everything is loaded
    console.log(`mnaually refresh the table`);   
    this.st.reload();  
  }

  
  refreshDetailInformation(orderActivity: OrderActivity) {
  
    this.loadClient(orderActivity); 
  }
  
  loadClient(orderActivity: OrderActivity) {
     
    if (orderActivity.clientId && orderActivity.client == null) {
      this.loadingOrderActivityDetailsRequest++;
      this.localCacheService.getClient(orderActivity.clientId).subscribe(
        {
          next: (res) => {
            orderActivity.client = res;
            this.loadingOrderActivityDetailsRequest--;
          }, 
          error: () => this.loadingOrderActivityDetailsRequest--
        }
      );      
    } 
  }
  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }
  

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      order: [null], 
      username: [null], 
      rfCode: [null], 
      client: [null], 
      activityDateTimeRanger: [null],
      activityDate: [null],
    });
 
  }
 

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number') },
    { title: this.i18n.fanyi("transaction-group-id"), index: 'transactionGroupId', iif: () => this.isChoose('transactionGroupId') },
    { title: this.i18n.fanyi("client"), render: 'clientColumn', 
        iif: () => this.threePartyLogisticsFlag && this.isChoose('client'), width: 150},
    { title: this.i18n.fanyi("order"), index: 'orderNumber', iif: () => this.isChoose('order') },
    { title: this.i18n.fanyi("order.line"), index: 'orderLineNumber', iif: () => this.isChoose('orderLine') },
    { title: this.i18n.fanyi("type"), index: 'orderActivityType', iif: () => this.isChoose('type') },
    { title: this.i18n.fanyi("quantity"), index: 'quantity', iif: () => this.isChoose('quantity') },
    { title: this.i18n.fanyi("shipmnet"), index: 'shipmentNumber', iif: () => this.isChoose('shipmnet')  },
    { title: this.i18n.fanyi("pick"), index: 'pickNumber', iif: () => this.isChoose('pick')  },
    { title: this.i18n.fanyi("short-allocation"), index: 'shortAllocation.id', iif: () => this.isChoose('shortAllocation')  }, 
    
    { title: this.i18n.fanyi("username"), index: 'username', iif: () => this.isChoose('username')  }, 
    { title: this.i18n.fanyi("rfCode"), index: 'rfCode', iif: () => this.isChoose('rfCode')  }, 
    
    {
      title: this.i18n.fanyi("transaction-date"), 
      render: 'transactionDate',
      iif: () => this.isChoose('transactionDate') 
    },     
   
  ];
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("transaction-group-id"), value: 'transactionGroupId', checked: true },
    { label: this.i18n.fanyi("client"), value: 'client', checked: true },
    { label: this.i18n.fanyi("order"), value: 'order', checked: true },
    { label: this.i18n.fanyi("order.line"), value: 'orderLine', checked: true },
    { label: this.i18n.fanyi("type"), value: 'type', checked: true },
    { label: this.i18n.fanyi("quantity"), value: 'quantity', checked: true },
    { label: this.i18n.fanyi("shipmnet"), value: 'shipmnet', checked: true },
    { label: this.i18n.fanyi("pick"), value: 'pick', checked: true },
    { label: this.i18n.fanyi("short-allocation"), value: 'shortAllocation', checked: true },
    { label: this.i18n.fanyi("username"), value: 'username', checked: true },
    { label: this.i18n.fanyi("rfCode"), value: 'rfCode', checked: true },
    { label: this.i18n.fanyi("transactionDate"), value: 'transactionDate', checked: true },
    
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }


}
