import { formatDate } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { ReportPrinterConfiguration } from '../models/report-printer-configuration';
import { ReportType } from '../models/report-type.enum'; 
import { ReportPrinterConfigurationService } from '../services/report-printer-configuration.service';

@Component({
    selector: 'app-report-report-printer-configuration',
    templateUrl: './report-printer-configuration.component.html',
    styleUrls: ['./report-printer-configuration.component.less'],
    standalone: false
})
export class ReportReportPrinterConfigurationComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<ReportPrinterConfiguration>> = [
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

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder, 
    private reportPrinterConfigurationService: ReportPrinterConfigurationService,
    private messageService: NzMessageService, 
    private titleService: TitleService, 
    private userService: UserService,
    private utilService: UtilService,
  ) {
    userService.isCurrentPageDisplayOnly("/report/report-printer-configuration").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );              
   }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllReportPrinterConfiguration: ReportPrinterConfiguration[] = [];
  listOfDisplayReportPrinterConfiguration: ReportPrinterConfiguration[] = [];

  searchResult = '';
  reportTypes = ReportType;
  reportTypesKeys = Object.keys(this.reportTypes);
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
        this.searchForm.value.type.value,
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
