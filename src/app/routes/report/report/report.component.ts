import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Report } from '../models/report';
import { ReportType } from '../models/report-type.enum';
import { ReportService } from '../services/report.service';

@Component({
    selector: 'app-report-report',
    templateUrl: './report.component.html',
    styleUrls: ['./report.component.less'],
    standalone: false
})
export class ReportReportComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Report>> = [
    {
      name: 'type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.type, b.type),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'company.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableNumber(a.companyId, b.companyId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'warehouse.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableNumber(a.warehouseId, b.warehouseId),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'printer-type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableObjField(a, b, "printerType"),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'report.orientation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.reportOrientation, b.reportOrientation),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'fileName',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.fileName, b.fileName),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }
  ];

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private reportService: ReportService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/report/report").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );            
  }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllReports: Report[] = [];
  listOfDisplayReports: Report[] = [];

  searching = false;
  searchResult = '';

  isSpinning = false;
  reportTypes = ReportType;
   

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllReports = [];
    this.listOfDisplayReports = [];
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';

    this.reportService
      .getAll(
        this.searchForm.controls.type.value,
        this.searchForm.controls.companySpecific.value,
        this.searchForm.controls.warehouseSpecific.value
      )
      .subscribe(
        reportRes => {
          this.setupReportUrl(reportRes);
          this.listOfAllReports = reportRes;
          this.listOfDisplayReports = reportRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: reportRes.length
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      );
  }

  setupReportUrl(reports: Report[]): void {
    reports.forEach(report => {
      let fileUrl = `${environment.api.baseUrl}/resource/reports/templates?`;
      if(this.isLabel(report.type!)) {

        if (report.fileName.endsWith(".prn")) {

          fileUrl = `${fileUrl}fileName=${report.fileName}`;
        }
        else {
          
          fileUrl = `${fileUrl}fileName=${report.fileName}.prn`;
        }
      }
      else {

        if (report.fileName.endsWith(".jrxml")) {

          fileUrl = `${fileUrl}fileName=${report.fileName}`;
        }
        else {
          
          fileUrl = `${fileUrl}fileName=${report.fileName}.jrxml`;
        }
      } 

      if (report.companyId) {
        fileUrl = `${fileUrl}&companyId=${report.companyId}`;
      }
      if (report.warehouseId) {
        fileUrl = `${fileUrl}&warehouseId=${report.warehouseId}`;
      }
      report.fileUrl = fileUrl;
      if (!this.isLabel(report.type!)) {
        this.setupReportI18NFileNames(report);
      }
    });
  }
  
  setupReportI18NFileNames(report: Report) {
    report.mapOfPropertyFiles = {};
    const reportI18NFileNames = [
      `${report.fileName  }_en_US.properties`,
      `${report.fileName  }_zh_CN.properties`,
    ];
 
    reportI18NFileNames.forEach(
      fileName => {
        let fileUrl = `${environment.api.baseUrl}/resource/reports/templates?fileName=${fileName}`;
  
        if (report.companyId) {
          fileUrl = `${fileUrl}&companyId=${report.companyId}`;
        }
        if (report.warehouseId) {
          fileUrl = `${fileUrl}&warehouseId=${report.warehouseId}`;
        }
        report.mapOfPropertyFiles![fileName] = fileUrl;
      }
    )
    

  }

  currentPageDataChange($event: Report[]): void {
    this.listOfDisplayReports! = $event;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.report'));
    // initiate the search form
    this.searchForm = this.fb.group({
      type: [null],
      companySpecific: [null],
      warehouseSpecific: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.type) {
        this.searchForm.controls.type.setValue(params.type);
        this.search();
      }
    });
  }

  removeCustomizedReport(report: Report): void {
    // make sure we will only allow the user
    this.isSpinning = true;
    this.reportService.removeReport(report).subscribe({
      next: () => {
          this.message.success(this.i18n.fanyi('message.action.success'));
          this.isSpinning = false;
          this.search();
      }, 
      error: () => this.isSpinning = false
    });
  }
  isLabel(reportType: ReportType) : boolean {
    return this.reportService.isLabel(reportType);
  }
}
