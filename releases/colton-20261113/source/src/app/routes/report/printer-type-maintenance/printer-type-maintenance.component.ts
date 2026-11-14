import { Component, inject, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { PrinterType } from '../models/printer-type'; 
import { PrinterTypeService } from '../services/printer-type.service';

@Component({
    selector: 'app-report-printer-type-maintenance',
    templateUrl: './printer-type-maintenance.component.html',
    standalone: false
})
export class ReportPrinterTypeMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentPrinterType!: PrinterType;  
  isSpinning = false;


  constructor(  
    private printerTypeService: PrinterTypeService,
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private router: Router
  ) {
    this.currentPrinterType = {
       
      companyId: this.companyService.getCurrentCompany()!.id,

      name: "",
      description:"",
    }
  }

  ngOnInit(): void { 
    this.stepIndex = 0;
  }
  
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirmPrinterType(): void { 
    this.isSpinning = true;
    
    this.printerTypeService.addPrinterType(this.currentPrinterType).subscribe({
        next: (printerTypeRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/report/printer-type?name=${printerTypeRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
    }
        

}
