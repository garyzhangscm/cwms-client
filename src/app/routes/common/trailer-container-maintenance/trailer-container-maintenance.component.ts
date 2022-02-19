import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { Trailer } from '../../outbound/models/trailer';
import { ReportService } from '../../report/services/report.service';
import { RF } from '../../util/models/rf';
import { RfService } from '../../util/services/rf.service';
import { Warehouse } from '../../warehouse-layout/models/warehouse';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { TrailerContainer } from '../models/trailer-container';
import { TrailerContainerService } from '../services/trailer-container.service';

@Component({
  selector: 'app-common-trailer-container-maintenance',
  templateUrl: './trailer-container-maintenance.component.html',
})
export class CommonTrailerContainerMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentTrailerContainer!: TrailerContainer;
  warehouses: Warehouse[] = [];
  warehouseSpecific = false;
  isSpinning = false;
  
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private companyService: CompanyService,
    private trailerContainerService: TrailerContainerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void { 
    // right now we only allow add new RF.
    // since RF only have one attribute, it make no sense to
    // allow the user to change it , as it is a business key
    // the user will need to remove the record and create
    // a new record if the user want to change the code
    this.currentTrailerContainer = this.getEmptyTrailerContainer();
    this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.new'));
    this.pageTitle = this.i18n.fanyi('page.report.maintenance.new');
  }
  getEmptyTrailerContainer(): TrailerContainer {
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
 
      companyId: this.companyService.getCurrentCompany()!.id,
  
  
      number: "",
      description: "",
      size: 0,
    };
  }

  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmTrailerContainer(): void { 

    this.isSpinning= true; 
    this.trailerContainerService.addTrailerContainer(this.currentTrailerContainer).subscribe({
      next: (containerRes) => {
        this.isSpinning= false; 
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.router.navigateByUrl(`/common/trailer-container?number=${containerRes.number}`);
        }, 2500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }

}
