import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms'; 
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { UserService } from '../../auth/services/user.service';
import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { BillingRequest } from '../models/billing-request';
import { BillingRequestService } from '../services/billing-request.service';

@Component({
    selector: 'app-billing-billable-activity',
    templateUrl: './billable-activity.component.html',
    styleUrls: ['./billable-activity.component.less'],
    standalone: false
})
export class BillingBillableActivityComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;
  
  threePartyLogisticsFlag = false;
  selectedBillingRequests: BillingRequest[] = [];
 
  
  availableClients: Client[] = []; 
  billingRequests: BillingRequest[] = [];

  // billing request table
  @ViewChild('st', { static: false })
  st!: STComponent;
  columns: STColumn[] = [
     
    { title: '', index: 'number', type: 'checkbox' },
    { title: this.i18n.fanyi("number"),  index: 'number' ,  },   
    
    {
      title: this.i18n.fanyi("billableCategory"), 
      render: 'billableCategoryColumn', 
    },     
    { title: this.i18n.fanyi("rate"),  render: 'rateColumn' },  
    { title: this.i18n.fanyi("billingCycle"),  index: 'billingCycle' ,  },  
    { title: this.i18n.fanyi("totalAmount"),  render: 'totalAmountColumn' ,},  
    { title: this.i18n.fanyi("totalCharge"),   render: 'totalChargeColumn'},  
    
     
  ];  
  
  searchForm!: UntypedFormGroup; 
  searchResult = ""; 
   
  displayOnly = false;
  constructor( 
    private messageService: NzMessageService, 
    private billingRequestService: BillingRequestService,
    private clientService: ClientService,
    private fb: UntypedFormBuilder,
    private localCacheService: LocalCacheService,
    private userService: UserService) {
      userService.isCurrentPageDisplayOnly("/billing/billable-activity").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );        
  }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      client: [null],
      dateRanger: [null], 

    });

    
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;

          // only initial the client list in a 3pl environment
          
          this.clientService.getClients().subscribe({
            next: (clientRes) => this.availableClients = clientRes
            
          });
        }
        else {
          this.threePartyLogisticsFlag = false;
        }  
      },  
    });

  }

    
  resetForm(): void {
    this.searchForm.reset(); 
  }
  search(): void {
    
    this.isSpinning = true; 
    
    let startTime : Date = this.searchForm.value.dateRanger.value ? 
        this.searchForm.value.dateRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.dateRanger.value ? 
        this.searchForm.value.dateRanger.value[1] : undefined;  

    if (startTime == null || endTime == null) {
      this.messageService.error("please choose the time range to continue");
      this.isSpinning = false;
      this.searchResult = '';
      return;
    }
    if (this.searchForm.value.client.value == null) {
      this.messageService.error("please choose the client to continue");
      this.isSpinning = false;
      this.searchResult = '';
      return;
    }

    this.billingRequestService.generateBillingRequests(
          startTime!,  endTime!, this.searchForm.value.client.value,
          undefined,
          false
      ).subscribe(
        {
          next: (billingRequestRes) => {
            this.billingRequests = billingRequestRes;
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: billingRequestRes.length
            });
          }, 
          error: () => {
            this.isSpinning = false;
            this.searchResult = '';
          }
  
        }
      ) ;
      
  } 

  
  billingRequestTableChanged(event: STChange) : void { 
    // console.log(`event.type: ${event.type}`);

    if (event.type === 'checkbox') {
      
      this.selectedBillingRequests = [];
      const dataList: STData[] = this.st.list; 
      dataList
          .filter( data => data.checked)
          .forEach(
            data => {
              // get the selected billing request and added it to the 
              // selectedBillingRequests
              this.selectedBillingRequests = [...this.selectedBillingRequests,
                  ...this.billingRequests.filter(
                    billingRequest => billingRequest.number == data["number"]

                  )
              ]

            }
          );
    } 

  }
  

}
