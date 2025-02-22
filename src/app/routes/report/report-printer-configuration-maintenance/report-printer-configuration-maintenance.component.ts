import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service'; 
import { PrintingService } from '../../common/services/printing.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Printer } from '../models/printer'; 
import { ReportPrinterConfiguration } from '../models/report-printer-configuration';
import { ReportType } from '../models/report-type.enum';
import { ReportPrinterConfigurationService } from '../services/report-printer-configuration.service'; 

@Component({
    selector: 'app-report-report-printer-configuration-maintenance',
    templateUrl: './report-printer-configuration-maintenance.component.html',
    standalone: false
})
export class ReportReportPrinterConfigurationMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentReportPrinterConfiguration!: ReportPrinterConfiguration;
  reportTypes = ReportType;
  reportTypesKeys = Object.keys(this.reportTypes);
  availablePrinters: Printer[] = [];


  constructor(private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private reportPrinterConfigurationService: ReportPrinterConfigurationService,
    private messageService: NzMessageService,
    private printingService: PrintingService,
    private router: Router,) { }

  ngOnInit(): void {

    this.titleService.setTitle(this.i18n.fanyi('page.report-printer-configuration.maintenance.modify'));
    this.pageTitle = this.i18n.fanyi('page.report-printer-configuration.maintenance.modify');

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.reportPrinterConfigurationService.getReportPrinterConfiguration(params['id']).subscribe(reportPrinterConfigurationRes => {
          this.currentReportPrinterConfiguration = reportPrinterConfigurationRes;


        });
      } else {
        this.currentReportPrinterConfiguration = this.getEmptyReportPrinterConfiguration();


      }
    });

    this.stepIndex = 0;
    this.loadAvaiablePrinters();

  }


  getEmptyReportPrinterConfiguration(): ReportPrinterConfiguration {
    return {
      id: undefined,

      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      reportType: undefined,
      criteriaValue: "",
      printerName: "",
      copies: 1,
    };
  }
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmReportPrinterConfiguration(): void {
    if (this.currentReportPrinterConfiguration.id) {

      this.reportPrinterConfigurationService.changeReportPrinterConfiguration(this.currentReportPrinterConfiguration)
        .subscribe(reportPrinterConfigurationRes => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.router.navigateByUrl(`/report/report-printer-configuration`);
          }, 500);
        })
    }
    else {

      this.reportPrinterConfigurationService.addReportPrinterConfiguration(this.currentReportPrinterConfiguration)
        .subscribe(reportPrinterConfigurationRes => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.router.navigateByUrl(`/report/report-printer-configuration`);
          }, 500);
        })
    }
  }

  loadAvaiablePrinters(): void {
    console.log(`start to load avaiable printers`)
    if (this.warehouseService.getServerSidePrintingFlag() == true) {
      console.log(`will get printer from server`)
      this.printingService.getAllServerPrinters().subscribe(printers => {
        // this.availablePrinters = printers;
        printers.forEach(
          (printer, index) => {
            this.availablePrinters.push({
              id: index, name: printer.name, description: printer.name, warehouseId: this.warehouseService.getCurrentWarehouse().id
            });

          }); 
      })

    }
    else {

      console.log(`will get printer from local tools`)
      this.printingService.getAllLocalPrinters().forEach(
        (printer, index) => {
          this.availablePrinters.push({
            id: index, name: printer, description: printer, warehouseId: this.warehouseService.getCurrentWarehouse().id
          });

        });
    }

    //console.log(`availablePrinters: ${JSON.stringify(this.availablePrinters)}`);

  }
}
