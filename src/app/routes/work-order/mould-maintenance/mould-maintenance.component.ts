import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { TimeUnit } from '../../common/models/time-unit.enum';
import { WarehouseLocation } from '../../warehouse-layout/models/warehouse-location';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Mould } from '../models/mould';
import { ProductionLineCapacity } from '../models/production-line-capacity';
import { MouldService } from '../services/mould.service';

@Component({
    selector: 'app-work-order-mould-maintenance',
    templateUrl: './mould-maintenance.component.html',
    styleUrls: ['./mould-maintenance.component.less'],
    standalone: false
})
export class WorkOrderMouldMaintenanceComponent implements OnInit {

  currentMould!: Mould;
  stepIndex = 0;
  pageTitle: string;
  newMould = true;


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private mouldService: MouldService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private activatedRoute: ActivatedRoute) {
    this.pageTitle = this.i18n.fanyi('menu.main.mould.maintenance');

    this.currentMould = this.createEmptyMould();
  }

  createEmptyMould(): Mould {
    return {

      name: "",

      description: "",
      warehouseId: this.warehouseService.getCurrentWarehouse().id,

    }
  }


  ngOnInit(): void {


    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        // Get the production line by ID
        this.mouldService.getMould(params.id)
          .subscribe(mould => {
            this.currentMould = mould;

            this.newMould = false;
          });
      }
      else {
        // this.currentProductionLine = this.createEmptyProductionLine(); 
        this.newMould = true;
      }
    });

  }


  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;

  }

  confirm(): void {
    if (this.newMould) {

      this.mouldService.addMould(this.currentMould)
        .subscribe(mouldRes => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.router.navigateByUrl(`/work-order/mould?name=${this.currentMould.name}`);
          }, 500);
        });
    }
    else {

      this.mouldService.changeMould(this.currentMould)
        .subscribe(mouldRes => {
          this.messageService.success(this.i18n.fanyi('message.save.complete'));
          setTimeout(() => {
            this.router.navigateByUrl(`/work-order/mould?name=${this.currentMould.name}`);
          }, 500);
        });
    }
  }


}
