import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service'; 
import { InventoryStatus } from '../models/inventory-status'; 
import { InventoryStatusService } from '../services/inventory-status.service';

@Component({
    selector: 'app-inventory-inventory-status-maintenance',
    templateUrl: './inventory-status-maintenance.component.html',
    standalone: false
})
export class InventoryInventoryStatusMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentInventoryStatus!: InventoryStatus;
  newInventoryStatus = true;
     
  isSpinning = false;

  reasonWhenReceiving = 'NA';
  reasonWhenProducing = 'NA';
  reasonWhenAdjusting = 'NA';
 

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
      if (params['id']) {
        this.isSpinning = true;
        this.inventoryStatusService.getInventoryStatus(params['id']).subscribe({
           next: (inventoryStatusRes) => {
            this.currentInventoryStatus = inventoryStatusRes;
            this.newInventoryStatus = false;
            this.titleService.setTitle(this.i18n.fanyi('modify'));
            this.pageTitle = this.i18n.fanyi('modify');
            this.isSpinning = false;

            this.setupReasonCodeRequirement();
           }

        })   
      } else {
        this.currentInventoryStatus = this.getEmptyInventoryStatus(); 
        this.newInventoryStatus = true;
        // By default, we will always create the item under specific warehouse 
        this.titleService.setTitle(this.i18n.fanyi('new'));
        this.pageTitle = this.i18n.fanyi('new');
        
        this.setupReasonCodeRequirement();
      }
    });

    this.stepIndex = 0; 
  }
 
  setupReasonCodeRequirement() {
    
    this.reasonWhenReceiving = 'NA';
    this.reasonWhenProducing = 'NA';
    this.reasonWhenAdjusting = 'NA';

    if (this.currentInventoryStatus.reasonRequiredWhenReceiving) {
      this.reasonWhenReceiving = "Required";
    }
    else if (this.currentInventoryStatus.reasonRequiredWhenReceiving) {
      this.reasonWhenReceiving = "Optional";
    }

    if (this.currentInventoryStatus.reasonRequiredWhenProducing) {
      this.reasonWhenProducing = "Required";
    }
    else if (this.currentInventoryStatus.reasonRequiredWhenProducing) {
      this.reasonWhenProducing = "Optional";
    }

    if (this.currentInventoryStatus.reasonRequiredWhenAdjusting) {
      this.reasonWhenAdjusting = "Required";
    }
    else if (this.currentInventoryStatus.reasonRequiredWhenAdjusting) {
      this.reasonWhenAdjusting = "Optional";
    }
  }
  setupReasonCodeOnInventoryStatus() {
    
    if (this.reasonWhenReceiving == 'Required') {
      this.currentInventoryStatus.reasonRequiredWhenReceiving = true;
      this.currentInventoryStatus.reasonOptionalWhenReceiving = false;
    }
    else if (this.reasonWhenReceiving == 'Optional') {
      this.currentInventoryStatus.reasonRequiredWhenReceiving = false;
      this.currentInventoryStatus.reasonOptionalWhenReceiving = true;
    }
    else  {
      this.currentInventoryStatus.reasonRequiredWhenReceiving = false;
      this.currentInventoryStatus.reasonOptionalWhenReceiving = false;
    }
    
    if (this.reasonWhenProducing == 'Required') {
      this.currentInventoryStatus.reasonRequiredWhenProducing = true;
      this.currentInventoryStatus.reasonOptionalWhenProducing = false;
    }
    else if (this.reasonWhenProducing == 'Optional') {
      this.currentInventoryStatus.reasonRequiredWhenProducing = false;
      this.currentInventoryStatus.reasonOptionalWhenProducing = true;
    }
    else  {
      this.currentInventoryStatus.reasonRequiredWhenProducing = false;
      this.currentInventoryStatus.reasonOptionalWhenProducing = false;
    }

    
    if (this.reasonWhenAdjusting == 'Required') {
      this.currentInventoryStatus.reasonRequiredWhenAdjusting  = true;
      this.currentInventoryStatus.reasonOptionalWhenAdjusting = false;
    }
    else if (this.reasonWhenAdjusting == 'Optional') {
      this.currentInventoryStatus.reasonRequiredWhenAdjusting  = false;
      this.currentInventoryStatus.reasonOptionalWhenAdjusting = true;
    }
    else  {
      this.currentInventoryStatus.reasonRequiredWhenAdjusting  = false;
      this.currentInventoryStatus.reasonOptionalWhenAdjusting  = false;
    } 
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

    this.setupReasonCodeOnInventoryStatus();

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
