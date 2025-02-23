import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineMonitor } from '../models/production-line-monitor';
import { ProductionLineMonitorService } from '../services/production-line-monitor.service';
import { ProductionLineService } from '../services/production-line.service';

@Component({
    selector: 'app-work-order-production-line-monitor-maintenance',
    templateUrl: './production-line-monitor-maintenance.component.html',
    standalone: false
})
export class WorkOrderProductionLineMonitorMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentProductionLineMonitor!: ProductionLineMonitor;   
  isSpinning = false;
  newProductionLineMonitor = true;
  availableProductionLines: ProductionLine[] = [];


  constructor( 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private warehouseService: WarehouseService, 
    private productionLineMonitorService: ProductionLineMonitorService,
    private productionLineService: ProductionLineService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('modify'));
    this.pageTitle = this.i18n.fanyi('modify');
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
            this.isSpinning = true;
            this.productionLineMonitorService.getProductionLineMonitor(params['id']).subscribe(
              {
    
                next: (productionLineMonitorRes) => {
                  this.currentProductionLineMonitor = productionLineMonitorRes;
                  
                  this.newProductionLineMonitor = false;
                  this.isSpinning = false;
                }
    
              }); 
      } else {
            this.newProductionLineMonitor = true
            this.currentProductionLineMonitor = this.getEmptyProductionLineMonitor();
             
            this.titleService.setTitle(this.i18n.fanyi('new'));
            this.pageTitle = this.i18n.fanyi('new'); 
      }
    }); 

    this.loadAllProductionLines();
 
  }
   
  loadAllProductionLines() : void {

    this.productionLineService.getProductionLines().subscribe(
      {
        next: (productionLineRes) => this.availableProductionLines = productionLineRes
      }
    )
  }
   
  getEmptyProductionLineMonitor(): ProductionLineMonitor {
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
  
      name: "",
      description: "",
      productionLine: {
        name: "",
        productionLineCapacities: []

      }
  
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void { 
    this.isSpinning = true;
    if (this.newProductionLineMonitor) {

      this.productionLineMonitorService.addProductionLineMonitor(this.currentProductionLineMonitor).subscribe({
        next: (productionLineMonitorRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/production-line-monitor?name=${productionLineMonitorRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
    else {

      this.productionLineMonitorService.changeProductionLineMonitor(this.currentProductionLineMonitor).subscribe({
        next: (productionLineMonitorRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/work-order/production-line-monitor?name=${productionLineMonitorRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }

  selectedProductionLineChanged(selectedProductionLineId: number) {
    if (selectedProductionLineId == null) {
      this.currentProductionLineMonitor.productionLine =  
        {
          name: "",
          productionLineCapacities: []

        };
    }
    this.currentProductionLineMonitor.productionLine = 
        this.availableProductionLines.find(
          productionLine => productionLine.id === selectedProductionLineId
        );

  }

}
