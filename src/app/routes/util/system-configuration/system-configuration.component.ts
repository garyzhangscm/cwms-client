import { Component, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzTreeHigherOrderServiceToken } from 'ng-zorro-antd/core/tree';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SystemConfiguration } from '../models/system-configuration';
import { SystemConfigurationService } from '../services/system-configuration.service';

@Component({
  selector: 'app-util-system-configuration',
  templateUrl: './system-configuration.component.html',
})
export class UtilSystemConfigurationComponent implements OnInit {

  currentSystemConfiguration: SystemConfiguration | undefined;

  constructor(private http: _HttpClient,
    private systemConfigurationService: SystemConfigurationService,
    private warehouseService: WarehouseService,
    private messageService: NzMessageService,
    private i18n: I18NService,
    private companyService: CompanyService) {
    this.currentSystemConfiguration = {

      companyId: companyService.getCurrentCompany()!.id,
      warehouseId: warehouseService.getCurrentWarehouse().id,
      allowDataInitialFlag: false,
      serverSidePrinting: true,
    }
    systemConfigurationService.getSystemConfiguration().subscribe(configuration => {
      if (configuration) {

        this.currentSystemConfiguration = configuration;
      }
    });
  }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { }

  saveConfiguration(): void {
    this.systemConfigurationService.saveSystemConfiguration(this.currentSystemConfiguration!).subscribe(
      res => {

        this.messageService.success(this.i18n.fanyi('message.action.success'));
      }
    )
  }

}
