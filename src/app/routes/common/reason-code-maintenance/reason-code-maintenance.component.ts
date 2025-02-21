import { Component, Inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Mould } from '../../work-order/models/mould';
import { ReasonCode } from '../models/reason-code';
import { ReasonCodeType } from '../models/reason-code-type.enum';
import { ReasonCodeService } from '../services/reason-code.service';

@Component({
    selector: 'app-common-reason-code-maintenance',
    templateUrl: './reason-code-maintenance.component.html',
    standalone: false
})
export class CommonReasonCodeMaintenanceComponent   {
  currentReasonCode!: ReasonCode;
  stepIndex = 0;
  pageTitle: string; 
  isSpinning = false;
  reasonCodeTypes = ReasonCodeType;


  constructor(private http: _HttpClient,
    private warehouseService: WarehouseService,
    private reasonCodeService: ReasonCodeService,
    private messageService: NzMessageService,
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService) {
    this.pageTitle = this.i18n.fanyi('reason-code');

    this.currentReasonCode = {
      warehouseId: warehouseService.getCurrentWarehouse().id,
      name: "",
      description: ""
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
      this.reasonCodeService.addReasonCode(this.currentReasonCode)
        .subscribe({
          next: () => {

            this.messageService.success(this.i18n.fanyi('message.save.complete'));
            setTimeout(() => {
              this.isSpinning = false;
              this.router.navigateByUrl(`/common/reason-code`);
            }, 500);
          },
          error: () =>  this.isSpinning = false


        }); 
     
  }

}
