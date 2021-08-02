import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { ReportHistory } from '../models/report-history';
import { ReportPrinterConfiguration } from '../models/report-printer-configuration';
import { ReportType } from '../models/report-type.enum';
import { ReportHistoryService } from '../services/report-history.service';
import { ReportPrinterConfigurationService } from '../services/report-printer-configuration.service';

@Component({
  selector: 'app-report-report-printer-configuration',
  templateUrl: './report-printer-configuration.component.html',
  styleUrls: ['./report-printer-configuration.component.less'],
})
export class ReportReportPrinterConfigurationComponent implements OnInit {
  listOfColumns: ColumnItem[] = [
    {
      name: 'report.type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportPrinterConfiguration, b: ReportPrinterConfiguration) => this.utilService.compareNullableString(a.reportType, b.reportType),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'report-printer-configuration.criteria-value',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportPrinterConfiguration, b: ReportPrinterConfiguration) => this.utilService.compareNullableString(a.criteriaValue, b.criteriaValue),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'printer.name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportPrinterConfiguration, b: ReportPrinterConfiguration) => this.utilService.compareNullableString(a.printerName, b.printerName),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  constructor(
    private fb: FormBuilder,
    private i18n: I18NService,
    private modalService: NzModalService,
    private reportPrinterConfigurationService: ReportPrinterConfigurationService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private router: Router,
    private utilService: UtilService,
  ) { }

  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  listOfAllReportPrinterConfiguration: ReportPrinterConfiguration[] = [];
  listOfDisplayReportPrinterConfiguration: ReportPrinterConfiguration[] = [];

  searchResult = '';
  reportTypes = ReportType;
  isSpinning = false;



  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllReportPrinterConfiguration = [];
    this.listOfDisplayReportPrinterConfiguration = [];
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';

    this.reportPrinterConfigurationService
      .getAll(
        this.searchForm.controls.type.value,
      )
      .subscribe(
        reportPrinterConfigurationRes => {
          this.listOfAllReportPrinterConfiguration = reportPrinterConfigurationRes;
          this.listOfDisplayReportPrinterConfiguration = reportPrinterConfigurationRes;

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: reportPrinterConfigurationRes.length,
          });
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      );
  }



  currentPageDataChange($event: ReportPrinterConfiguration[]): void {
    this.listOfDisplayReportPrinterConfiguration! = $event;
  }



  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.report-printer-configuration'));
    // initiate the search form
    this.searchForm = this.fb.group({
      type: [null],
    });


  }
  removeConfiguration(reportPrinterConfiguration: ReportPrinterConfiguration) {
    this.isSpinning = true;
    this.reportPrinterConfigurationService.removeReportPrinterConfiguration(reportPrinterConfiguration)
      .subscribe(res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.search();
        this.isSpinning = false;
      },
        () => this.isSpinning = false)
  }

}
