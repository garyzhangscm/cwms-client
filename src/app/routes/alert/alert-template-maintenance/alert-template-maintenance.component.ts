import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service'; 
import { AlertDeliveryChannel } from '../models/alert-delivery-channel';
import { AlertTemplate } from '../models/alert-template';
import { AlertType } from '../models/alert-type';
import { AlertTemplateService } from '../services/alert-template.service';

@Component({
    selector: 'app-alert-alert-template-maintenance',
    templateUrl: './alert-template-maintenance.component.html',
    standalone: false
})
export class AlertAlertTemplateMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentAlertTemplate!: AlertTemplate;   
  isSpinning = false;
  newAlertTemplate = true;
  
  alertTypes = AlertType; 
  alertDeliveryChannels = AlertDeliveryChannel;


  constructor( 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService,  
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private alertTemplateService: AlertTemplateService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('modify'));
    this.pageTitle = this.i18n.fanyi('modify');
     
        this.activatedRoute.queryParams.subscribe(params => {
          if (params.id) {
            this.alertTemplateService.getAlertTemplate(params.id).subscribe(
              {
    
                next: (alertTemplateRes) => {
                  this.currentAlertTemplate = alertTemplateRes;
                  this.newAlertTemplate = false;
                }
    
              }); 
          } else {
            this.newAlertTemplate = true
            this.currentAlertTemplate = this.getEmptyAlertTemplate();
             
            this.titleService.setTitle(this.i18n.fanyi('new'));
            this.pageTitle = this.i18n.fanyi('new'); 
          }
        }); 

 
  }
   
   
  getEmptyAlertTemplate(): AlertTemplate {
    return {
      companyId: this.companyService.getCurrentCompany()!.id, 
  
      template: "",
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmAlertTemplate(): void { 
    this.isSpinning = true;
    if (this.newAlertTemplate) {

      this.alertTemplateService.addAlertTemplate(this.currentAlertTemplate).subscribe({
        next: (alertTemplateRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/alert/template?type=${alertTemplateRes.type}&deliveryChannel=${alertTemplateRes.deliveryChannel}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
    else {

      this.alertTemplateService.changeAlertTemplate(this.currentAlertTemplate).subscribe({
        next: (alertTemplateRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/alert/template?type=${alertTemplateRes.type}&deliveryChannel=${alertTemplateRes.deliveryChannel}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }


}
