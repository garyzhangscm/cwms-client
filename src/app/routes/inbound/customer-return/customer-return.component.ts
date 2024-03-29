import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { Trailer } from '../../outbound/models/trailer';
import { OrderLineService } from '../../outbound/services/order-line.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { CustomerReturnOrder } from '../models/customer-return-order';
import { ReceiptStatus } from '../models/receipt-status.enum';
import { CustomerReturnOrderService } from '../services/customer-return-order.service';

@Component({
  selector: 'app-inbound-customer-return',
  templateUrl: './customer-return.component.html',
  styleUrls: ['./customer-return.component.less'],
})
export class InboundCustomerReturnComponent implements OnInit {
  isSpinning = false;
  
  receiptStatusList = ReceiptStatus;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("RMANumber"),  index: 'rmaNumber' , 
    iif: () => this.isChoose('RMANumber')  }, 
    { title: this.i18n.fanyi("trackingNumber"),  index: 'trackingNumber' , 
    iif: () => this.isChoose('trackingNumber')  }, 
    {
      title: this.i18n.fanyi("customer"), 
      render: 'customerColumn',
      iif: () => this.isChoose('customer')  
    },
    { title: this.i18n.fanyi("status"),  index: 'status' , 
    iif: () => this.isChoose('status')  }, 
    { title: this.i18n.fanyi("allowUnexpectedItem"),  index: 'allowUnexpectedItem' , 
    iif: () => this.isChoose('allowUnexpectedItem')  }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("RMANumber"), value: 'RMANumber', checked: true },
    { label: this.i18n.fanyi("trackingNumber"), value: 'trackingNumber', checked: true },
    { label: this.i18n.fanyi("customer"), value: 'customer', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("allowUnexpectedItem"), value: 'allowUnexpectedItem', checked: true },      
    
  ];

 
  searchForm!: UntypedFormGroup;
  customerReturnOrders: CustomerReturnOrder[] = [];
  searchResult = "";

  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private customerReturnOrderService: CustomerReturnOrderService, 
    private fb: UntypedFormBuilder, 
    private userService: UserService,
    private orderLineService: OrderLineService,
    private localCacheService: LocalCacheService,) { 
      userService.isCurrentPageDisplayOnly("/inbound/customer-return").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );               
    }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      statusList: [null],
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params.number) { 
        this.searchForm!.controls.number.setValue(params.number);
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
    this.customerReturnOrders = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.customerReturnOrderService
      .getCustomerReturnOrders(this.searchForm.value.number, false, 
        this.searchForm!.controls.statusList.value,)
      .subscribe({

        next: (customerReturnRes) => {
          this.customerReturnOrders = customerReturnRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: customerReturnRes.length
          });
 

          this.refreshDetailInformations(this.customerReturnOrders);
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   

  
  // we will load the client / customer / item information 
  // asyncronized
  refreshDetailInformations(customerReturnOrders: CustomerReturnOrder[]) { 
    customerReturnOrders.forEach(
      customerReturnOrder => this.refreshDetailInformation(customerReturnOrder)
    );
  }
  refreshDetailInformation(customerReturnOrder: CustomerReturnOrder) {
  
      this.loadClient(customerReturnOrder); 
     
      this.loadCustomer(customerReturnOrder); 

      // this.loadItems(receipt);
  }

  loadClient(customerReturnOrder: CustomerReturnOrder) {
     
    if (customerReturnOrder.clientId && customerReturnOrder.client == null) {
      this.localCacheService.getClient(customerReturnOrder.clientId).subscribe(
        {
          next: (clientRes) => customerReturnOrder.client = clientRes
        }
      );
      
    }
  }
  loadCustomer(customerReturnOrder: CustomerReturnOrder) {
     
    if (customerReturnOrder.customerId && customerReturnOrder.customer == null) {
      this.localCacheService.getCustomer(customerReturnOrder.customerId).subscribe(
        {
          next: (customerRes) => customerReturnOrder.customer = customerRes
        }
      );
      
    }
  } 

  modifyCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder) {

  }
  removeCustomerReturnOrder(customerReturnOrder: CustomerReturnOrder) {

  }
  
  csrTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showCSRDetails(event.expand);
    }

  }
  showCSRDetails(customerReturnOrder: CustomerReturnOrder): void {  
    customerReturnOrder.customerReturnOrderLines.forEach(
      csrLine => {
        if (!csrLine.outboundOrderNumber) {

          this.orderLineService.getOrderLine(csrLine.outboundOrderLineId!).subscribe(
            outboundOrderLine => {
              csrLine.outboundOrderNumber = outboundOrderLine.orderNumber; 
              
            }
          )
        }
        if (!csrLine.item) {

          this.localCacheService.getItem(csrLine.itemId!).subscribe(
              {
                next: (itemRes) => {
                  csrLine.item = itemRes; 
                }
              }
          )
        }
      }
    )
  }
}
