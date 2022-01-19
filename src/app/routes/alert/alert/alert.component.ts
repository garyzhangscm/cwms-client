import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Alert } from '../models/alert';
import { AlertStatus } from '../models/alert-status';
import { AlertType } from '../models/alert-type';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-alert-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.less']
})
export class AlertAlertComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("type"),  index: 'type' , }, 
    { title: this.i18n.fanyi("keyWords"),  index: 'keyWords' , }, 
    { title: this.i18n.fanyi("ketitleyWords"),  index: 'title' , }, 
    { title: this.i18n.fanyi("message"),  index: 'message' , }, 
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("resend"),  
          type: 'link',
          click: (_record) => this.resendAlert(_record)
        }
      ]
    }
  ]; 

  
  searchForm!: FormGroup;
  alerts: Alert[] = [];
  searchResult = "";
  alertTypes = AlertType;
  alertStatusList = AlertStatus;
   
  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private messageService: NzMessageService,
    private router: Router, 
    private fb: FormBuilder,) { }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.alert.alert'));
    // initiate the search form
    this.searchForm = this.fb.group({
      type: [null],
      status: [null],
      keywords: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.type || params.status  || params.keywords ) {
        this.searchForm.controls.type.setValue(params.type);
        this.searchForm.controls.status.setValue(params.tstatusype);
        this.searchForm.controls.keywords.setValue(params.keywords);
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
    this.alertService
      .getAlerts(this.searchForm.value.type, this.searchForm.value.status, 
         this.searchForm.value.keywords )
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
