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
import { AlertDeliveryChannel } from '../models/alert-delivery-channel';
import { AlertStatus } from '../models/alert-status';
import { AlertTemplate } from '../models/alert-template';
import { AlertType } from '../models/alert-type';
import { AlertTemplateService } from '../services/alert-template.service';

@Component({
    selector: 'app-alert-alert-template',
    templateUrl: './alert-template.component.html',
    styleUrls: ['./alert-template.component.less'],
    standalone: false
})
export class AlertAlertTemplateComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    {
      title: this.i18n.fanyi("type"), 
      render: 'typeColumn', 
    }, 
    
    { title: this.i18n.fanyi("deliveryChannel"),  index: 'deliveryChannel'   },    
    { title: this.i18n.fanyi("template"),  index: 'template'   },    
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 
   
  
  searchForm!: UntypedFormGroup;
  alertTemplates: AlertTemplate[] = [];
  searchResult = "";
  alertTypes = AlertType; 
  alertDeliveryChannels = AlertDeliveryChannel;
   
  displayOnly = false;

  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private alertTemplateService: AlertTemplateService,
    private messageService: NzMessageService,
    private router: Router, 
    private fb: UntypedFormBuilder,
    private userService: UserService) { 
      userService.isCurrentPageDisplayOnly("/alert/alert-template").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );  
    
  }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.alert.template'));
    // initiate the search form
    this.searchForm = this.fb.group({
      type: [null],
      deliveryChannel: [null], 

    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.type || params.deliveryChannel ) {
        this.searchForm.controls.type.setValue(params.type);
        this.searchForm.controls.deliveryChannel.setValue(params.deliveryChannel); 
        this.search();
      }
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.alertTemplates = []; 
  }
  search(): void {
    this.isSpinning = true; 


    this.alertTemplateService
      .getAlertTemplates(this.searchForm.value.type, 
        this.searchForm.value.deliveryChannel,  )
      .subscribe({

        next: (alertTemplateRes) => {
          this.alertTemplates = alertTemplateRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: alertTemplateRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
  
  
  removeAlertTemplate(alertTemplate: AlertTemplate) : void{
    
    this.alertTemplateService.removeAlertTemplate(alertTemplate).subscribe({
      next: () => {
        
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
      }
    });
    
  }

}
