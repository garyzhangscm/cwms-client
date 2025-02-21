import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { BillableRequest } from '../models/billable-request';
import { BillableRequestService } from '../services/billable-request.service';

@Component({
    selector: 'app-util-billable-request',
    templateUrl: './billable-request.component.html',
    styleUrls: ['./billable-request.component.less'],
    standalone: false
})
export class UtilBillableRequestComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("company"),  index: 'company.name' , }, 
    { title: this.i18n.fanyi("warehouse"),  index: 'warehouse.name' , }, 
    { title: this.i18n.fanyi("serviceName"),  index: 'serviceName' , }, 
    { title: this.i18n.fanyi("webAPIEndpoint"),  index: 'webAPIEndpoint' , }, 
    { title: this.i18n.fanyi("requestMethod"),  index: 'requestMethod' , }, 
    { title: this.i18n.fanyi("parameters"),  index: 'parameters' , }, 
    { title: this.i18n.fanyi("username"),  index: 'username' , }, 
    { title: this.i18n.fanyi("transactionId"),  index: 'transactionId' , }, 
    { title: this.i18n.fanyi("rate"),  index: 'rate' , }, 
  ]; 

  
  searchForm!: UntypedFormGroup;
  billableRequests: BillableRequest[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, 
    private billableRequestService: BillableRequestService, 
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/util/billable-request").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                   
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.billable-request'));
    // initiate the search form
    this.searchForm = this.fb.group({  
  
        dateTimeRanger: [null],
        date: [null], 
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.billableRequests = []; 
  }
  search(): void {
    this.isSpinning = true; 
    
    let startTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.controls.dateTimeRanger.value ? 
        this.searchForm.controls.dateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.controls.date.value;

    this.billableRequestService
      .getBillableRequest(undefined, startTime, endTime, specificDate)
      .subscribe({

        next: (billableRequestRes) => {
          this.billableRequests = billableRequestRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: billableRequestRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
}
