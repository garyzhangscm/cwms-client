import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OperationType } from '../models/operation-type';
import { OperationTypeService } from '../services/operation-type.service';

@Component({
    selector: 'app-work-task-operation-type-maintenance',
    templateUrl: './operation-type-maintenance.component.html',
    standalone: false
})
export class WorkTaskOperationTypeMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentOperationType!: OperationType;

  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private operationTypeService: OperationTypeService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private messageService: NzMessageService,
    private router: Router
  ) {
    this.currentOperationType = {
      name: "",
      description: "",
      warehouseId: warehouseService.getCurrentWarehouse().id,
    }
  }

  isSpinning = false;
  ngOnInit(): void {  
    this.titleService.setTitle(this.i18n.fanyi('new'));
    this.pageTitle = this.i18n.fanyi('new');
  } 
 
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void { 

    this.isSpinning= true; 
    this.operationTypeService.addOperationType(this.currentOperationType).subscribe({
      next: (operationTypeRes) => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning= false; 
          this.router.navigateByUrl(`/work-task/operation-type?name=${operationTypeRes.name}`);
        }, 500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }

}
