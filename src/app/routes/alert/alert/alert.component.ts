import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Alert } from '../models/alert';
import { AlertStatus } from '../models/alert-status';
import { AlertType } from '../models/alert-type';
import { AlertService } from '../services/alert.service';

@Component({
    selector: 'app-alert-alert',
    templateUrl: './alert.component.html', 
    standalone: false
})
export class AlertAlertComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    {
      title: this.i18n.fanyi("createdTime"), 
      render: 'createdTimeColumn', width: 200,
      iif: () => this.isChoose('createdTimeColumn') 
    },    
    {
      title: this.i18n.fanyi("lastSentTime"), 
      render: 'lastSentTimeColumn', 
      iif: () => this.isChoose('lastSentTimeColumn'),
      width: 200
    },  
    {
      title: this.i18n.fanyi("type"), 
      render: 'typeColumn', width: 200,
      iif: () => this.isChoose('type') 
    }, 
    
    { title: this.i18n.fanyi("keyWords"),  index: 'keyWords' ,
        iif: () => this.isChoose('keyWords')  }, 
    { title: this.i18n.fanyi("title"),  index: 'title' , 
        iif: () => this.isChoose('title') }, 
    { title: this.i18n.fanyi("message"),  index: 'message' ,
        iif: () => this.isChoose('message')  }, 
    { title: this.i18n.fanyi("status"),  index: 'status' , width: 150,
        iif: () => this.isChoose('status')  }, 
    { title: this.i18n.fanyi("errorMessage"),  index: 'errorMessage' ,
            iif: () => this.isChoose('errorMessage')  },    
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("resend"),  
          type: 'link',
          click: (_record) => this.resendAlert(_record),
        }
      ], 
      width: 150,
      fixed: 'right',
    }
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("type"), value: 'type', checked: true },
    { label: this.i18n.fanyi("keyWords"), value: 'keyWords', checked: true },
    { label: this.i18n.fanyi("title"), value: 'title', checked: true },
    { label: this.i18n.fanyi("message"), value: 'message', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("errorMessage"), value: 'errorMessage', checked: true },
    { label: this.i18n.fanyi("createdTime"), value: 'createdTimeColumn', checked: true },
    { label: this.i18n.fanyi("lastSentTime"), value: 'lastSentTimeColumn', checked: true }, 
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }
  
  searchForm!: UntypedFormGroup;
  alerts: Alert[] = [];
  searchResult = "";
  alertTypes = AlertType;
  alertTypeKeys = Object.keys(this.alertTypes);
  alertStatusList = AlertStatus;
  alertStatusListKeys = Object.keys(this.alertStatusList);
   
  displayOnly = false;
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private messageService: NzMessageService,
    private router: Router, 
    private fb: UntypedFormBuilder,
    private userService: UserService) {
      
    userService.isCurrentPageDisplayOnly("/alert/alert").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    ); 
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.alert.alert'));
    // initiate the search form
    this.searchForm = this.fb.group({
      type: [null],
      status: [null],
      keyWords: [null],
      dateTimeRanger: [null],
      date: [null],

    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['type'] || params['status']  || params['keywords'] ) {
        this.searchForm.value.type.setValue(params['type']);
        this.searchForm.value.status.setValue(params['status']);
        this.searchForm.value.keywords.setValue(params['keywords']);
        this.search();
      }
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.alerts = []; 
  }
  search(): void {
    this.isSpinning = true; 
    
    let startTime : Date = this.searchForm.value.dateTimeRanger.value ? 
        this.searchForm.value.dateTimeRanger.value[0] : undefined; 
    let endTime : Date = this.searchForm.value.dateTimeRanger.value ? 
        this.searchForm.value.dateTimeRanger.value[1] : undefined; 
    let specificDate : Date = this.searchForm.value.date.value;


    this.alertService
      .getAlerts(this.searchForm.value.type, this.searchForm.value.status, 
         this.searchForm.value.keyWords, 
         startTime, endTime, specificDate )
      .subscribe({

        next: (alertRes) => {
          this.alerts = alertRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: alertRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
  
  resendAlert(alert: Alert) : void{
    
    this.alertService.resetAlert(alert).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    });
    
  }

}
