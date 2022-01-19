import { Component, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { EmailAlertConfiguration } from '../models/email-alert-configuration';
import { EmailAlertConfigurationService } from '../services/email-alert-configuration.service';

@Component({
  selector: 'app-alert-configuration',
  templateUrl: './configuration.component.html',
})
export class AlertConfigurationComponent implements OnInit {
  currentEmailAlertConfiguration: EmailAlertConfiguration | undefined;

  constructor(private http: _HttpClient,
    private emailAlertConfigurationService: EmailAlertConfigurationService,    
    private messageService: NzMessageService,
    private i18n: I18NService,
    private companyService: CompanyService) {

    this.currentEmailAlertConfiguration = {

      companyId: companyService.getCurrentCompany()!.id,      
      host: "",
      port: 0,

      username: "",
      password: "",

      transportProtocol: "",
      authFlag: true,
      starttlsEnableFlag: true,
      debugFlag: true,
    }
    
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { 
    this.emailAlertConfigurationService.getEmailAlertConfigurations().subscribe(
      {
        next: (emailAlertConfigurationRes) => this.currentEmailAlertConfiguration = emailAlertConfigurationRes
      }
    )
  }

  saveConfiguration(): void {
    this.emailAlertConfigurationService.changeEmailAlertConfiguration(this.currentEmailAlertConfiguration!).subscribe(
      res => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
      }
    )
  }

}
