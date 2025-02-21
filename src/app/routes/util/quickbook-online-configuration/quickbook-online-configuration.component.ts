import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { QuickbookOnlineConfiguration } from '../models/quickbook-online-configuration';
import { QuickbookOnlineConfigurationService } from '../services/quickbook-online-configuration.service';

@Component({
    selector: 'app-util-quickbook-online-configuration',
    templateUrl: './quickbook-online-configuration.component.html',
    standalone: false
})
export class UtilQuickbookOnlineConfigurationComponent implements OnInit {
  isSpinning = false;
  
  currentQBOConfiguration: QuickbookOnlineConfiguration;

  displayOnly = false;
  constructor(
    private quickbookConfigurationService: QuickbookOnlineConfigurationService, 
    private messageService: NzMessageService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/util/quickbook/configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                      

      this.currentQBOConfiguration = {
        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        companyId: this.companyService.getCurrentCompany()!.id,

      }
    }

    
  searchForm!: UntypedFormGroup;
  ngOnInit(): void {
    this.searchForm = this.fb.group({
      clientId: [null],
      clientSecret: [null],      
      webhookVerifierToken: [null],      
      quickbookOnlineUrl: [null]
    });
    this.loadCurrentConfiguration();
 }

 loadCurrentConfiguration() {
   this.isSpinning = true;
   this.quickbookConfigurationService.getConfiguration().subscribe({
     next: (configRes) => {
        if (configRes != null) {
          this.currentQBOConfiguration = configRes;
        }
        else {
          this.currentQBOConfiguration = {
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
          }
        }
        this.displayCurrentConfiguration();
        this.isSpinning = false;
     }, 
     error: () => {
       this.isSpinning = false;
       this.displayCurrentConfiguration();
      }

   })

 }
 displayCurrentConfiguration() {
   
  this.searchForm.controls.clientId.setValue(this.currentQBOConfiguration.clientId);
  this.searchForm.controls.clientSecret.setValue(this.currentQBOConfiguration.clientSecret);
  this.searchForm.controls.webhookVerifierToken.setValue(this.currentQBOConfiguration.webhookVerifierToken);
  this.searchForm.controls.quickbookOnlineUrl.setValue(this.currentQBOConfiguration.quickbookOnlineUrl);
 }
 saveConfiguration(): void {
    this.isSpinning = true;
    this.currentQBOConfiguration = {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      companyId: this.companyService.getCurrentCompany()!.id,
      clientId: this.searchForm.value.clientId,
      clientSecret: this.searchForm.value.clientSecret,
      webhookVerifierToken: this.searchForm.value.webhookVerifierToken,
      quickbookOnlineUrl: this.searchForm.value.quickbookOnlineUrl,
    }
    this.quickbookConfigurationService.saveConfiguration(this.currentQBOConfiguration).subscribe(
      {
        next: (configRes) => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.currentQBOConfiguration = configRes;
          this.displayCurrentConfiguration();
          
          
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.fail"));
          this.currentQBOConfiguration = {
            warehouseId: this.warehouseService.getCurrentWarehouse().id,
            companyId: this.companyService.getCurrentCompany()!.id,
          };
          this.displayCurrentConfiguration();
        }
      }
    )

  }
  
}
