import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { PrintingService } from '../../common/services/printing.service';
import { Printer } from '../../report/models/printer';
import { ReportService } from '../../report/services/report.service';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RF } from '../models/rf';
import { RfService } from '../services/rf.service';

@Component({
    selector: 'app-util-rf-maintenance',
    templateUrl: './rf-maintenance.component.html',
    standalone: false
})
export class UtilRfMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentRF!: RF;
  
  availablePrinters: Printer[] = [];
  
  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private rfService: RfService,
    private printingService: PrintingService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private warehouseConfigurationService: WarehouseConfigurationService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  isSpinning = false;
  ngOnInit(): void { 
    this.availablePrinters = [];
    this.loadAvaiablePrinters();
    // right now we only allow add new RF.
    // since RF only have one attribute, it make no sense to
    // allow the user to change it , as it is a business key
    // the user will need to remove the record and create
    // a new record if the user want to change the code
    this.currentRF = this.getEmptyRF();
    this.titleService.setTitle(this.i18n.fanyi('rf'));
    this.pageTitle = this.i18n.fanyi('rf');
  }
  getEmptyRF(): RF {
    return {
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      rfCode: "",
      
    };
  }

  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfiguration) => {

        if (warehouseConfiguration.printingStrategy === PrintingStrategy.SERVER_PRINTER ||
          warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) {

          console.log(`will get printer from server`)
          this.printingService.getAllServerPrinters(warehouseConfiguration.printingStrategy).subscribe(printers => {
            // this.availablePrinters = printers;
            printers.forEach(
              (printer, index) => {
                this.availablePrinters.push({
                  id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
                });

              }); 
          })
        } 
        else  if (warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA) {
          
          console.log(`will get printer from local tools`)
          this.printingService.getAllLocalPrinters().forEach(
            (printer, index) => {
              this.availablePrinters.push({
                id: index, name: printer, description: printer, warehouseId: this.warehouseService.getCurrentWarehouse().id
              });

            });
        }
        else {
          
          this.messageService.error(this.i18n.fanyi('not-able-to-load-printers'));

        }
      }
    }) 

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
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => {
          this.isSpinning= false; 
          this.router.navigateByUrl(`/util/rf?rfCode=${rfRes.rfCode}`);
        }, 500);
      }, 
      error: () => {
        this.isSpinning= false; }
      });
    }
}
