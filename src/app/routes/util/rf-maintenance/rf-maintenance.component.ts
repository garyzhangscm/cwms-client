import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ReportService } from '../../report/services/report.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RF } from '../models/rf';
import { RfService } from '../services/rf.service';

@Component({
  selector: 'app-util-rf-maintenance',
  templateUrl: './rf-maintenance.component.html',
})
export class UtilRfMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentRF!: RF;
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private rfService: RfService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private reportService: ReportService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  isSpinning = false;
  ngOnInit(): void { 
    // right now we only allow add new RF.
    // since RF only have one attribute, it make no sense to
    // allow the user to change it , as it is a business key
    // the user will need to remove the record and create
    // a new record if the user want to change the code
    this.currentRF = this.getEmptyRF();
    this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.new'));
    this.pageTitle = this.i18n.fanyi('page.report.maintenance.new');
  }
  getEmptyRF(): RF {
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      rfCode: "",
    };
  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmRF(): void { 

    this.isSpinning= true; 
    this.rfService.addRf(this.currentRF).subscribe({
      next: (rfRes) => {
        this.isSpinning= false; 
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.router.navigateByUrl(`/util/rf?rfCode=${rfRes.rfCode}`);
        }, 2500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }
}
