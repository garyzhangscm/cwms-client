import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { id } from '@swimlane/ngx-charts';
import { index } from 'd3';
import { NzMessageService } from 'ng-zorro-antd/message';

import { TimeUnit } from '../../common/models/time-unit.enum';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLineType } from '../models/production-line-type';
import { ProductionLineTypeService } from '../services/production-line-type.service';

@Component({
  selector: 'app-work-order-production-line-type-maintenance',
  templateUrl: './production-line-type-maintenance.component.html',
})
export class WorkOrderProductionLineTypeMaintenanceComponent  {
  currentProductionLineType!: ProductionLineType;
  stepIndex = 0;
  pageTitle: string;  

  isSpinning = false;


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private companyService: CompanyService, 
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private productionLineTypeService: ProductionLineTypeService, ) {
    this.pageTitle = this.i18n.fanyi('menu.main.production-line-type.maintenance');

    this.currentProductionLineType = this.createEmptyProductionLineType();
  }

  createEmptyProductionLineType() {
    return {

      id: undefined,
      name: "",
      description: "",

      warehouseId: this.warehouseService.getCurrentWarehouse().id,

    }
  }   

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void { 
      this.isSpinning = true; 
      this.productionLineTypeService.addProductionLineType(this.currentProductionLineType)
        .subscribe({
          next: () => {

            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/work-order/production-line-type`);
            }, 500);
          }, 
          error: () => this.isSpinning = false


        }); 
  }  
}