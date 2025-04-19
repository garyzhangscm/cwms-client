import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DA_SERVICE_TOKEN } from '@delon/auth';
import { I18NService } from '@core'; 
import { I18nPipe, SettingsService, User, ALAIN_I18N_TOKEN } from '@delon/theme';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms'; 
import { PrintingService } from 'src/app/routes/common/services/printing.service';
import { WarehouseConfigurationService } from 'src/app/routes/warehouse-layout/services/warehouse-configuration.service';
import { PrintingStrategy } from 'src/app/routes/warehouse-layout/models/printing-strategy.enum';
import { Printer } from 'src/app/routes/report/models/printer';
import { WarehouseService } from 'src/app/routes/warehouse-layout/services/warehouse.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'header-user',
  template: `
    <div class="alain-default__nav-item d-flex align-items-center px-sm" nz-dropdown nzPlacement="bottomRight" [nzDropdownMenu]="userMenu">
      <nz-avatar [nzSrc]="user.avatar" nzSize="small" class="mr-sm" />
      {{ user.name }}
    </div>
    <nz-dropdown-menu #userMenu="nzDropdownMenu">
      <div nz-menu class="width-sm">
        <div nz-menu-item routerLink="/pro/account/center">
          <i nz-icon nzType="user" class="mr-sm"></i>
          {{ 'menu.account.center' | i18n }}
        </div>
        <!--
        <div nz-menu-item routerLink="/pro/account/settings">
          <i nz-icon nzType="setting" class="mr-sm"></i>
          {{ 'menu.account.settings' | i18n }}
        </div>
-->
        <div nz-menu-item (click)="openSetupPrinterModal()">
          <i nz-icon nzType="setting" class="mr-sm"></i>
          {{ 'printer' | i18n }}
        </div>
        <div nz-menu-item routerLink="/exception/trigger">
          <i nz-icon nzType="close-circle" class="mr-sm"></i>
          {{ 'menu.account.trigger' | i18n }}
        </div>
        <li nz-menu-divider></li>
        <div nz-menu-item (click)="logout()">
          <i nz-icon nzType="logout" class="mr-sm"></i>
          {{ 'menu.account.logout' | i18n }}
        </div>
      </div>
    </nz-dropdown-menu>

    <nz-modal [(nzVisible)]="isSetupPrinterModalVisible" 
        nzTitle="Printer"  (nzOnOk)="setupPrinter()" nzClosable="true" (nzOnCancel)="isSetupPrinterModalVisible = false">
      <ng-container *nzModalContent> 
            <div nz-row [nzGutter]="24"> 
              <div nz-col [nzSpan]="24">
                <nz-form-item>
                    <nz-form-label [nzSpan]="8">
                    {{ 'default-label-printer' | i18n }}
                    </nz-form-label>
                    <nz-form-control [nzSpan]="16">
                        <nz-select [(ngModel)]="defaultLabelPrinter" style="width: 250px">
                            @for (availablePrinter of availablePrinters; track availablePrinter) {
                              <nz-option [nzLabel]="availablePrinter.name"
                                [nzValue]="availablePrinter.name">
                              </nz-option>
                            }       
                        </nz-select>    
                    </nz-form-control>
                </nz-form-item>
              </div>
            </div>
            <div nz-row [nzGutter]="24"> 
              <div nz-col [nzSpan]="24">
                <nz-form-item>
                    <nz-form-label [nzSpan]="8">
                    {{ 'default-report-printer' | i18n }}
                    </nz-form-label>
                    <nz-form-control [nzSpan]="16">
                        <nz-select [(ngModel)]="defaultReportPrinter" style="width: 250px">
                            @for (availablePrinter of availablePrinters; track availablePrinter) {
                              <nz-option [nzLabel]="availablePrinter.name"
                                [nzValue]="availablePrinter.name">
                              </nz-option>
                            }       
                        </nz-select>    
                    </nz-form-control>
                </nz-form-item>
              </div>
            </div>     
      </ng-container>
    </nz-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NzDropDownModule, NzMenuModule, NzIconModule, 
    I18nPipe, NzAvatarModule, NzModalModule, NzSelectModule,FormsModule, 
    NzCardModule, NzFormModule]
})
export class HeaderUserComponent {

  isSetupPrinterModalVisible = false; 
  availablePrinters: Printer[] = []; 
  defaultLabelPrinter: string = "";
  defaultReportPrinter: string = "";
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  private readonly settings = inject(SettingsService);  
  private readonly printingService = inject(PrintingService); 
  private readonly warehouseService = inject(WarehouseService); 
  private readonly messageService = inject(NzMessageService); 
  private readonly warehouseConfigurationService = inject(WarehouseConfigurationService); 
  private readonly router = inject(Router);
  private readonly tokenService = inject(DA_SERVICE_TOKEN);
  get user(): User {
    return this.settings.user;
  }
 

  
  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    this.warehouseConfigurationService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfiguration) => {

        if (warehouseConfiguration.printingStrategy === PrintingStrategy.SERVER_PRINTER) {

          console.log(`will get printer from server`)
          this.printingService.getAllServerPrinters(warehouseConfiguration.printingStrategy).subscribe(printers => {
              
            printers.forEach(
              (printer, index) => {
                
                this.availablePrinters = [...this.availablePrinters, 
                  {
                      id: index, 
                      name: printer.name, 
                      description: printer.name, 
                      warehouseId: this.warehouseService.getCurrentWarehouse().id
                  }
                ];
                /*
                this.availablePrinters.push({
                  id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
                });
                */

              }); 
          })
        }         
        else  if (warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_LOCAL_DATA ||
          warehouseConfiguration.printingStrategy === PrintingStrategy.LOCAL_PRINTER_SERVER_DATA) {
          
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


  openSetupPrinterModal() {
    
    this.loadAvaiablePrinters();
    this.isSetupPrinterModalVisible = true;
  }

  setupPrinter() {

    this.printingService.setupCurrentStationDefaultLabelPrinter(this.defaultLabelPrinter);
    this.printingService.setupCurrentStationDefaultReportPrinter(this.defaultReportPrinter);
    this.isSetupPrinterModalVisible = false;
  }

  logout(): void {
    this.tokenService.clear();
    this.router.navigateByUrl(this.tokenService.login_url!);
  }
}
