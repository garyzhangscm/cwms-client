import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { Report } from '../models/report';
import { ReportOrientation } from '../models/report-orientation.enum';
import { ReportType } from '../models/report-type.enum';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-report-report-maintenance',
  templateUrl: './report-maintenance.component.html',
  styleUrls: ['./report-maintenance.component.less'],
})
export class ReportReportMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentReport!: Report;
  reportTypes = ReportType;
  constructor(private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private i18n: I18NService,
    private reportService: ReportService, 
    private messageService: NzMessageService,
    private router: Router,) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.id) {
        this.reportService.getReport(params.id).subscribe(reportRes => {
          this.currentReport = reportRes;

          this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.modify'));
          this.pageTitle = this.i18n.fanyi('page.report.maintenance.modify'); 
        });
      } else {
        this.currentReport = this.getEmptyReport();
        this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.new'));
        this.pageTitle = this.i18n.fanyi('page.report.maintenance.new');
      }
    });

    this.stepIndex = 0;
    
  }


  
  getEmptyReport(): Report {
    return {
      id: undefined,      
      name: '',      
      companyId: undefined,
      company: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),    
      description: '',
      type: ReportType.PDF,
      fileName: '',
      reportOrientation: ReportOrientation.LANDSCAPE 
    };
  }
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }
  
  confirmReport(): void {
    if (this.currentReport.id) {

      this.reportService.changeReport(this.currentReport).subscribe(reportRes =>{
        this.messageService.success(this.i18n.fanyi('message.report.changed'));
        setTimeout(() => {
          this.router.navigateByUrl(`/report/report?name=${reportRes.name}`);
        }, 2500);
      })
    }
  }
}
