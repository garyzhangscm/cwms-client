import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzUploadChangeParam, NzUploadFile } from 'ng-zorro-antd/upload';
import { environment } from '@env/environment'; 
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
  standardReport = true;
  companySpecific = false;
  warehouseSpecific = false;
  fileList: NzUploadFile[] = [];
  templateFileUploadUrl = "";
  acceptUploadedFileTypes= ".jrxml";

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
          
          this.companySpecific = (this.currentReport.warehouseId !== null);
          this.warehouseSpecific = (this.currentReport.warehouseId !== null);
          this.standardReport = !this.companySpecific && !this.warehouseSpecific;
          this.fileList = [
            {
              uid: this.currentReport.id!.toString(),
              name: this.currentReport.fileName,
              status: "done",
              response: "", // custom error message to show
              url: this.getReportTemplateUrl(this.currentReport)
            }];
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
        this.templateFileUploadUrl = `resource/reports/templates/upload/${this.currentReport.warehouseId}`

      }
    });

    this.stepIndex = 0;
    
  }

  getReportTemplateUrl(report : Report) : string {
    let url = "";
    url = `${environment.SERVER_URL}/resource/reports/templates?filename=${report.fileName}`;
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
      name: '',      
      companyId: this.warehouseService.getCurrentWarehouse().companyId,
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
    else {
      
      this.reportService.addReport(this.currentReport, this.companySpecific, this.warehouseSpecific)
      .subscribe(reportRes =>{
        this.messageService.success(this.i18n.fanyi('message.report.added'));
        setTimeout(() => {
          this.router.navigateByUrl(`/report/report?name=${reportRes.name}`);
        }, 2500);
      })
    }
  }

  handleUploadChange(info: NzUploadChangeParam): void {
    if (info.file.status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === 'done') {
      this.messageService.success(`${info.file.name} ${this.i18n.fanyi('file.upload.success')}`);

      if (this.currentReport.fileName.length === 0) {

        this.currentReport.fileName = info.file.name;
      }
      
      this.fileList = [
        {
          uid: info.file.uid,
          name: info.file.name,
          status: info.file.status,
          response: "", // custom error message to show
          url: `${environment.SERVER_URL}/resource/reports/templates/upload/${info.file.response.data}`
        }];
    } else if (info.file.status === 'error') {
      this.messageService.error(`${info.file.name} ${this.i18n.fanyi('file.upload.fail')}`);
    }
    
    console.log(`====    handleUploadChange ====\n ${JSON.stringify(info)}`)
  }
}
