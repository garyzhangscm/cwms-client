import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, FormControl, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { newItemUOMQuantityValidator } from '../../directives/newItemUOMQuantityValidator';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { AllocationRoundUpStrategyType } from '../models/allocation-round-up-strategy-type.enum';
import { InventoryStatus } from '../models/inventory-status';
import { Item } from '../models/item';
import { ItemPackageType } from '../models/item-package-type';
import { ItemUnitOfMeasure } from '../models/item-unit-of-measure';
import { InventoryStatusService } from '../services/inventory-status.service';

@Component({
  selector: 'app-inventory-inventory-status-maintenance',
  templateUrl: './inventory-status-maintenance.component.html',
})
export class InventoryInventoryStatusMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentInventoryStatus!: InventoryStatus;
  newInventoryStatus = true;
     
  isSpinning = false;
 

  constructor(
    private fb: UntypedFormBuilder,
    private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private messageService: NzMessageService,
    private router: Router,
    private inventoryStatusService: InventoryStatusService,
    private activatedRoute: ActivatedRoute, 
    private warehouseService: WarehouseService,
  ) { 
 
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.isSpinning = true;
        this.inventoryStatusService.getInventoryStatus(params.id).subscribe({
           next: (inventoryStatusRes) => {
            this.currentInventoryStatus = inventoryStatusRes;
            this.newInventoryStatus = false;
            this.titleService.setTitle(this.i18n.fanyi('modify'));
            this.pageTitle = this.i18n.fanyi('modify');
            this.isSpinning = false;
           }

        })   
      } else {
        this.currentInventoryStatus = this.getEmptyInventoryStatus(); 
        this.newInventoryStatus = true;
        // By default, we will always create the item under specific warehouse 
        this.titleService.setTitle(this.i18n.fanyi('new'));
        this.pageTitle = this.i18n.fanyi('new');
      }
    });

    this.stepIndex = 0; 
  }
 

  getEmptyInventoryStatus(): InventoryStatus {
    return {
      id: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      name: "",
      description: "",
      availableStatusFlag: false
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }
  confirm(): void { 

    if (this.currentInventoryStatus.id != null) {
      this.isSpinning = true;
      this.inventoryStatusService.changeInventoryStatus(this.currentInventoryStatus).subscribe({
        next: (inventoryStatusRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/status?name=${inventoryStatusRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
      
    } else {
      
      this.isSpinning = true;
      this.inventoryStatusService.addInventoryStatus(this.currentInventoryStatus).subscribe({
        next: (inventoryStatusRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/inventory/status?name=${inventoryStatusRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  } 

}
