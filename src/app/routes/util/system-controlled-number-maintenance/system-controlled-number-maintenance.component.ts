import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { SystemControlledNumber } from '../models/system-controlled-number';
import { SystemControlledNumberService } from '../services/system-controlled-number.service';

@Component({
    selector: 'app-util-system-controlled-number-maintenance',
    templateUrl: './system-controlled-number-maintenance.component.html',
    standalone: false
})
export class UtilSystemControlledNumberMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentSystemControlledNumber!: SystemControlledNumber;
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private systemControlledNumberService: SystemControlledNumberService,
    private messageService: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  isSpinning = false;
  ngOnInit(): void { 
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.systemControlledNumberService.getSystemControlledNumber(params['id'])
            .subscribe({
              next: (systemControlledNumberRes) => this.currentSystemControlledNumber = systemControlledNumberRes
            });        
      }
      else {
        
    this.currentSystemControlledNumber = this.getEmptySystemControlledNumber();
      }
    });
    this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.new'));
    this.pageTitle = this.i18n.fanyi('page.report.maintenance.new');
  }

  getEmptySystemControlledNumber(): SystemControlledNumber {
    return {      

        warehouseId: this.warehouseService.getCurrentWarehouse().id,
        warehouse: this.warehouseService.getCurrentWarehouse(),

        variable: "",
        prefix: "",
        postfix: "",

        length: 0,
        currentNumber: 0,
        nextNumber: "",
        rollover: false,
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
    if (this.currentSystemControlledNumber.id) {
      this.systemControlledNumberService.changeSystemControlledNumber(this.currentSystemControlledNumber)
          .subscribe({
            next: (systemControlledNumberRes) => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              setTimeout(() => {
                this.isSpinning= false; 
                this.router.navigateByUrl(`/util/system-controlled-number?variable=${systemControlledNumberRes.variable}`);
              }, 500);
            }, 
            error: () => {
              this.isSpinning= false; 
            }
          });
    }
    else {
      this.systemControlledNumberService.addSystemControlledNumber(this.currentSystemControlledNumber)
          .subscribe({
            next: (systemControlledNumberRes) => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              setTimeout(() => {
                this.isSpinning= false; 
                this.router.navigateByUrl(`/util/system-controlled-number?variable=${systemControlledNumberRes.variable}`);
              }, 500);
            }, 
            error: () => {
              this.isSpinning= false; 
            }
          });

    }
  }
    

}
