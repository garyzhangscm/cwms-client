import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam } from 'ng-zorro-antd/upload';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { PrinterType } from '../models/printer-type';
import { Report } from '../models/report';
import { ReportOrientation } from '../models/report-orientation.enum';
import { PrinterTypeService } from '../services/printer-type.service';

@Component({
  selector: 'app-report-printer-type-maintenance',
  templateUrl: './printer-type-maintenance.component.html',
})
export class ReportPrinterTypeMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentPrinterType!: PrinterType;  
  isSpinning = false;


  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private companyService: CompanyService, 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private printerTypeService: PrinterTypeService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

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
          }, 2500);
        }, 
        error: () => this.isSpinning = false
      });
    }
        

}
