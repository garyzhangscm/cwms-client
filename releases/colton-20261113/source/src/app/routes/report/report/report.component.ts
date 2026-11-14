import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute,  } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 

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
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
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
 

  // Table data for display
  listOfAllReports: Report[] = [];
  listOfDisplayReports: Report[] = [];

  searching = false;
  searchResult = '';

  isSpinning = false;
  reportTypes = ReportType;
  reportTypesKeys = Object.keys(this.reportTypes);
   

  private readonly fb = inject(FormBuilder); 
  
  searchForm = this.fb.nonNullable.group({
    type: this.fb.control<string | undefined>('', { nonNullable: true, validators: []}),
    companySpecific: this.fb.control(undefined,{ nonNullable: true, validators:  []}),
    warehouseSpecific: this.fb.control(undefined, { nonNullable: true, validators: []}), 
  });
  
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
        this.searchForm.value.type,
        this.searchForm.value.companySpecific,
        this.searchForm.value.warehouseSpecific
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

  private readonly downloadHttp = inject(HttpClient);
  readonly downloading = new Set<string>();

  templateFileName(report: Report): string {
    const extension = this.isLabel(report.type!) ? '.prn' : '.jrxml';
    return report.fileName.toLowerCase().endsWith(extension) ? report.fileName : report.fileName + extension;
  }

  setupReportUrl(reports: Report[]): void {
    reports.forEach(report => {
      report.mapOfPropertyFiles = {};
      if (!this.isLabel(report.type!)) {
        const baseName = report.fileName.replace(/\.jrxml$/i, '');
        for (const locale of ['en_US', 'zh_CN']) {
          const fileName = `${baseName}_${locale}.properties`;
          report.mapOfPropertyFiles[fileName] = fileName;
        }
      }
    });
  }

  downloadTemplate(report: Report, fileName = this.templateFileName(report)): void {
    const key = `${report.id}:${fileName}`;
    if (this.downloading.has(key)) return;
    const params: Record<string, string> = { fileName };
    if (report.companyId != null) params['companyId'] = String(report.companyId);
    if (report.warehouseId != null) params['warehouseId'] = String(report.warehouseId);
    this.downloading.add(key);
    // HttpClient preserves the existing authentication and API-base interceptors.
    this.downloadHttp.get('resource/reports/templates', { params, responseType: 'blob' })
      .pipe(finalize(() => this.downloading.delete(key)))
      .subscribe({
        next: blob => {
          if (!blob.size || /json|text\/html/i.test(blob.type)) {
            this.message.error(this.i18n.fanyi('report.download-failed'));
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        },
        error: () => this.message.error(this.i18n.fanyi('report.download-failed'))
      });
  }

  currentPageDataChange($event: Report[]): void {
    this.listOfDisplayReports! = $event;
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.report'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['type']) {
        this.searchForm.controls.type.setValue(params['type']);
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
