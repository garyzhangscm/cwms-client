import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { EmailAlertConfiguration } from '../models/email-alert-configuration';
import { EmailAlertConfigurationService } from '../services/email-alert-configuration.service';

@Component({
    selector: 'app-alert-configuration',
    templateUrl: './configuration.component.html',
    standalone: false
})
export class AlertConfigurationComponent implements OnInit {
  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentEmailAlertConfiguration: EmailAlertConfiguration | undefined;

  isSpinning = false;
  passwordVisible = false;


  displayOnly = false;
  constructor(
    private emailAlertConfigurationService: EmailAlertConfigurationService,    
    private messageService: NzMessageService,
    private userService: UserService,
    private companyService: CompanyService) {
      userService.isCurrentPageDisplayOnly("/alert/configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );  
     

    this.currentEmailAlertConfiguration = {

      companyId: companyService.getCurrentCompany()!.id,      
      host: "",
      port: 0,

      username: "",
      password: "",
      sendFromEmail: "",

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
        next: (emailAlertConfigurationRes) => {
          if (emailAlertConfigurationRes != null) {
            this.currentEmailAlertConfiguration = emailAlertConfigurationRes;
          }
        }
      }
    )
  }

  saveConfiguration(): void {
    this.isSpinning = true;
    if (this.currentEmailAlertConfiguration!.id == null) {

      this.emailAlertConfigurationService.addEmailAlertConfiguration(this.currentEmailAlertConfiguration!).subscribe(
        {
          next: () => {
  
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
          }, 
          error: () => this.isSpinning = false
  
        }
      )
    }
    else {

      this.emailAlertConfigurationService.changeEmailAlertConfiguration(this.currentEmailAlertConfiguration!).subscribe(
        {
          next: () => {
  
            this.isSpinning = false;
            this.messageService.success(this.i18n.fanyi('message.action.success'));
          }, 
          error: () => this.isSpinning = false
  
        }
      )
    }
  }

}
