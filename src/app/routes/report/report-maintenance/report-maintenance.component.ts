import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';

import { UserService } from '../../auth/services/user.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { PrinterType } from '../models/printer-type';
import { Report } from '../models/report';
import { ReportOrientation } from '../models/report-orientation.enum';
import { ReportType } from '../models/report-type.enum';
import { PrinterTypeService } from '../services/printer-type.service';
import { ReportService } from '../services/report.service';

@Component({
    selector: 'app-report-report-maintenance',
    templateUrl: './report-maintenance.component.html',
    styleUrls: ['./report-maintenance.component.less'],
    standalone: false
})
export class ReportReportMaintenanceComponent implements OnInit {
  pageTitle = '';
  stepIndex = 0;
  currentReport!: Report;
  reportTypes = ReportType;
  standardReport = true;
  companySpecific = false;
  warehouseSpecific = false;
  fileList: NzUploadFile[] = [];
  templateFileUploadUrl = '';
  acceptUploadedFileTypes = '.jrxml,.properties,.prn';
  printerTypes: PrinterType[] = [];
  isSpinning = false;

  constructor(
    private http: _HttpClient,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private warehouseService: WarehouseService,
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private printerTypeService: PrinterTypeService,
    private reportService: ReportService,
    private messageService: NzMessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fileList = [];
    
    this.printerTypeService.getPrinterTypes().subscribe({
      next: (printerTypeRes) =>  {
        this.printerTypes = printerTypeRes; 
        this.activatedRoute.queryParams.subscribe(params => {
          if (params.id) {
            this.reportService.getReport(params.id).subscribe(reportRes => {
              this.currentReport = reportRes;
    
              this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.modify'));
              this.pageTitle = this.i18n.fanyi('page.report.maintenance.modify');
    
              this.companySpecific = this.currentReport.warehouseId !== null;
              this.warehouseSpecific = this.currentReport.warehouseId !== null;
              this.standardReport = !this.companySpecific && !this.warehouseSpecific;
              this.fileList = [
                {
                  uid: this.currentReport.id!.toString(),
                  name: this.currentReport.fileName,
                  status: 'done',
                  response: '', // custom error message to show
                  url: this.getReportTemplateUrl(this.currentReport)
                }
              ];
            });
          } else {
            // the user is adding a new customized report
            this.standardReport = false;
            this.currentReport = this.getEmptyReport();
            this.titleService.setTitle(this.i18n.fanyi('page.report.maintenance.new'));
            this.pageTitle = this.i18n.fanyi('page.report.maintenance.new');
            // to add a new report, the user is only able to add
            // a customized report(either at company level or at warehouse level)
            // at this moment, we are not allow the user to change the standard
            // report. So if the user is here,
            this.companySpecific = true;
            this.templateFileUploadUrl = `resource/reports/templates/upload/${this.currentReport.warehouseId}`;
          }
        });
    
      }
    });
    
    this.stepIndex = 0;
  }

  getReportTemplateUrl(report: Report): string {
    let url = '';
    url = `${environment.api.baseUrl}/resource/reports/templates?filename=${report.fileName}`;
    if (report.companyId) {
      url = `${url}&companyId=${report.companyId}`;
    }
    if (report.warehouseId) {
      url = `${url}&warehouseId=${report.warehouseId}`;
    }

    return url;
  }

  getEmptyReport(): Report {
    return {
      id: undefined,

      companyId: this.warehouseService.getCurrentWarehouse().companyId,
      company: undefined,
      warehouseId: this.warehouseService.getCurrentWarehouse().id,
      warehouse: this.warehouseService.getCurrentWarehouse(),
      description: '',
      type: undefined,
      fileName: '',
      reportOrientation: ReportOrientation.LANDSCAPE,  

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
      this.isSpinning = true;
      this.reportService.changeReport(this.currentReport).subscribe(reportRes => {
        this.messageService.success(this.i18n.fanyi('message.report.changed'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report?type=${reportRes.type}`);
        }, 500);
      });
    } else {
      this.isSpinning = true;
      this.reportService.addReport(this.currentReport, this.companySpecific, this.warehouseSpecific).subscribe(reportRes => {
        this.messageService.success(this.i18n.fanyi('message.report.added'));
        setTimeout(() => {
          this.isSpinning = false;
          this.router.navigateByUrl(`/report/report?type=${reportRes.type}`);
        }, 500);
      });
    }
  }

  handleUploadChange(info: NzUploadChangeParam): void { 
    if (info.file.status === 'done') {
      this.messageService.success(`${info.file.name} ${this.i18n.fanyi('file.upload.success')}`);

      // report files should ends with jrxml
      // label files should ends with prn
      if (info.file.name.endsWith('.jrxml') || info.file.name.endsWith('.prn')) {
        
        this.currentReport.fileName = info.file.name;
      }
      let url = `${environment.api.baseUrl}/resource/reports/templates/upload`;

      url = `${url}/${this.warehouseService.getCurrentWarehouse().id}`;
      url = `${url}/${this.userService.getCurrentUsername()}`;
      url = `${url}/${info.file.response.data}`;
 

      this.fileList = [
        ...this.fileList,
        {
          uid: info.file.uid,
          name: info.file.name,
          status: info.file.status,
          response: '', // custom error message to show
          url: url
        }
      ];
    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
    }

    
  }

  selectedPrinterTypeChanged(printerTypeId: number) : void {

    this.printerTypes.filter(
      printerType => printerType.id === printerTypeId
    ).forEach(
      printerType => this.currentReport.printerType = printerType
    );
  }
}
