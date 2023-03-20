import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { InventoryActivity } from '../../inventory/models/inventory-activity';
import { ItemFamily } from '../../inventory/models/item-family';
import { OrderActivity } from '../models/order-activity';
import { OrderActivityService } from '../services/order-activity.service';

@Component({
  selector: 'app-outbound-order-activity',
  templateUrl: './order-activity.component.html',
  styleUrls: ['./order-activity.component.less'],
})
export class OutboundOrderActivityComponent implements OnInit {
  searchForm!: UntypedFormGroup;
 

  // Table data for display
  listOfAllOrderActivities: OrderActivity[] = []; 


  isCollapse = false;
  isSpinning = false;
  searchResult= '';

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private orderActivityService: OrderActivityService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private userService: UserService,
    private titleService: TitleService, 
  ) { 
    this.displayOnly = userService.isCurrentPageDisplayOnly("/outbound/order-activity");
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllOrderActivities = []; 

  }
  search(): void { 
    this.isSpinning = true;
    this.searchResult = '';
    
    let startTime : Date = this.searchForm.controls.activityDateTimeRanger.value ? 
        this.searchForm.controls.activityDateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.activityDateTimeRanger.value ? 
        this.searchForm.controls.activityDateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.activityDate.value;

    this.orderActivityService
      .getOrderActivities(
        startTime,
        endTime,
        specificDate,
        this.searchForm.value.username,
        this.searchForm.value.rfCode,
        this.searchForm.value.order
      )
      .subscribe(
        orderActivityRes => {
          this.listOfAllOrderActivities = orderActivityRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: orderActivityRes.length,
          });
        },
        () => { 
          this.listOfAllOrderActivities = []; 
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }
   

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.order-activity'));
    this.initSearchForm();
  }

  initSearchForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      order: [null], 
      username: [null], 
      rfCode: [null], 
      activityDateTimeRanger: [null],
      activityDate: [null],
    });
 
  }
 

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number') },
    { title: this.i18n.fanyi("transaction-group-id"), index: 'transactionGroupId', iif: () => this.isChoose('transactionGroupId') },
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
