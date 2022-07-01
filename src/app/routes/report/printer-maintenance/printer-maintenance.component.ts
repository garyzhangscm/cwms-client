import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Printer } from '../models/printer';
import { PrinterType } from '../models/printer-type';
import { PrinterTypeService } from '../services/printer-type.service';
import { PrinterService } from '../services/printer.service';

@Component({
  selector: 'app-report-printer-maintenance',
  templateUrl: './printer-maintenance.component.html',
})
export class ReportPrinterMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentPrinter!: Printer;  
  printerTypes: PrinterType[] = [];
  isSpinning = false;
  newPrinter = true;


  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService, 
    private warehouseService: WarehouseService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private printerTypeService: PrinterTypeService,
    private printerService: PrinterService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('page.report.printer.modify'));
    this.pageTitle = this.i18n.fanyi('page.report.printer.modify');
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.printerService.getPrinter(params.id).subscribe(
          {

            next: (printerRes) => {
              this.currentPrinter = printerRes;
              this.newPrinter = false;
            }

          }); 
      } else {
        this.newPrinter = true
        this.currentPrinter = this.getEmptyPrinter();
        this.titleService.setTitle(this.i18n.fanyi('page.report.printer.new'));
        this.pageTitle = this.i18n.fanyi('page.report.printer.new'); 
      }
    });
  }
  
  
  getEmptyPrinter(): Printer {
    return {
      id: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      name: "",
      description: "",
      printerType: undefined
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmPrinter(): void { 
    this.isSpinning = true;
    if (this.newPrinter) {

      this.printerService.addPrinter(this.currentPrinter).subscribe({
        next: (printerRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/report/printer?name=${printerRes.name}`);
          }, 2500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
    else {

      this.printerService.changePrinter(this.currentPrinter).subscribe({
        next: (printerRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/report/printer?name=${printerRes.name}`);
          }, 2500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }
        

}
