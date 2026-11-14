import { Component, inject, OnInit } from '@angular/core';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { PrintingService } from '../../common/services/printing.service';
import { Printer } from '../../report/models/printer';
import { PrintingStrategy } from '../../warehouse-layout/models/printing-strategy.enum';
import { WarehouseConfigurationService } from '../../warehouse-layout/services/warehouse-configuration.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { RfConfiguration } from '../models/rf-configuration';
import { RfConfigurationService } from '../services/rf-configuration.service';

@Component({
    selector: 'app-util-rf-configuration',
    templateUrl: './rf-configuration.component.html',
    standalone: false
})
export class UtilRfConfigurationComponent implements OnInit {
  isSpinning = false;
  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentRFConfiguration: RfConfiguration;
  availablePrinters: Printer[] = [];

  displayOnly = false;
  constructor( 
    private rfConfigurationService: RfConfigurationService,
    private messageService: NzMessageService,
    private userService: UserService,
    private printingService: PrintingService, 
    private warehouseConfigurationService: WarehouseConfigurationService,
    private warehouseService: WarehouseService,  ) { 
      userService.isCurrentPageDisplayOnly("/util/rf-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                         

      this.currentRFConfiguration = {
        warehouseId: this.warehouseService.getCurrentWarehouse().id, 

      }
    }
 
  ngOnInit(): void { 
    this.loadCurrentConfiguration();
    
    this.availablePrinters = [];
    this.loadAvaiablePrinters();
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
 loadCurrentConfiguration() {
   this.isSpinning = true;
   this.rfConfigurationService.getRfConfiguration().subscribe({
     next: (configRes) => {
        if (configRes != null) {
          this.currentRFConfiguration = configRes;
        }
        else {
          this.currentRFConfiguration = {
            warehouseId: this.warehouseService.getCurrentWarehouse().id, 
    
          }
        } 
        this.isSpinning = false;
     }, 
     error: () => {
       this.isSpinning = false; 
      }

   })

 }
 
 saveConfiguration(): void {
    this.isSpinning = true;
     
    this.rfConfigurationService.saveRfConfiguration(this.currentRFConfiguration).subscribe(
      {
        next: (configRes) => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.success"));
          this.currentRFConfiguration = configRes; 
          
          
        }, 
        error: () => {
          
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi("message.action.fail")); 
        }
      }
    )

  }
}
