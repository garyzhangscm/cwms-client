import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Report } from '../models/report';
import { ReportHistory } from '../models/report-history';
import { ReportHistoryService } from '../services/report-history.service';
import { ReportService } from '../services/report.service';

@Component({
    selector: 'app-report-report-history',
    templateUrl: './report-history.component.html',
    styleUrls: ['./report-history.component.less'],
    standalone: false
})
export class ReportReportHistoryComponent implements OnInit {
  listOfColumns: Array<ColumnItem<ReportHistory>> = [
    {
      name: 'type',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareNullableString(a.type, b.type),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareNullableString(a.description, b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'report.printedDate',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareDateTime(a.printedDate, b.printedDate),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'report.printedUsername',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareNullableString(a.printedUsername, b.printedUsername),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'report.orientation',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareNullableString(a.reportOrientation, b.reportOrientation),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'fileName',
      showSort: true,
      sortOrder: null,
      sortFn: (a: ReportHistory, b: ReportHistory) => this.utilService.compareNullableString(a.fileName, b.fileName),
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
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private reportHistoryService: ReportHistoryService, 
    private titleService: TitleService, 
    private utilService: UtilService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/report/report-history").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );             
  }

  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllReportHistories: ReportHistory[] = [];
  listOfDisplayReportHistories: ReportHistory[] = [];

  searching = false;
  searchResult = '';

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllReportHistories = [];
    this.listOfDisplayReportHistories = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';

    this.reportHistoryService
      .getAll(
        this.searchForm.controls.name.value,
      )
      .subscribe(
        reportHistoryRes => {
          this.listOfAllReportHistories = reportHistoryRes;
          this.listOfDisplayReportHistories = reportHistoryRes;

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: reportHistoryRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  } 
  currentPageDataChange($event: ReportHistory[]): void {
    this.listOfDisplayReportHistories! = $event;
  } 
  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.report-history'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
    });


  }

  getReportResultFile(reportHistory: ReportHistory): void {
    console.log(`start to download file`);
    this.reportHistoryService.download(reportHistory.fileName).subscribe(reportResultFile => {
      console.log(`download file: ${JSON.stringify(reportResultFile)}`);
    })
  }

}
