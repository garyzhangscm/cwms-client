import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Report } from '../models/report';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-report-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.less'],
})
export class ReportReportComponent implements OnInit {

  listOfColumns: ColumnItem[] = [    
    {
          name: 'report.name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.name, b.name),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },{
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
        }, {
          name: 'warehouse.name',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableNumber(a.warehouseId, b.warehouseId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },  {
          name: 'type',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.type, b.type),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'report.orientation',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.reportOrientation, b.reportOrientation),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'fileName',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.fileName, b.fileName),
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
    private reportService: ReportService,
    private message: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,
    private router: Router,
    private utilService: UtilService,
  ) {}

  // Form related data and functions
  searchForm!: FormGroup;

  // Table data for display
  listOfAllReports: Report[] = [];
  listOfDisplayReports: Report[] = [];
  
  searching = false;
  searchResult = '';

  isSpinning = false;

  

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllReports = [];
    this.listOfDisplayReports = [];
  }

  search(): void {
    this.searching = true;
    this.searchResult = '';

    this.reportService
      .getAll(
        this.searchForm.controls.name.value,
        this.searchForm.controls.companySpecific.value,
        this.searchForm.controls.warehouseSpecific.value,
      )
      .subscribe(
        reportRes => {
          this.setupReportUrl(reportRes)
          this.listOfAllReports = reportRes;
          this.listOfDisplayReports = reportRes;

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: reportRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }
 
  setupReportUrl(reports: Report[]) : void {

    reports.forEach(report => {

      let fileUrl = `${environment.SERVER_URL}/resource/reports/templates?fileName=${report.fileName}`;
      if (report.companyId) {
        fileUrl = `${fileUrl}&companyId=${report.companyId}`;
      }if (report.warehouseId) {
        fileUrl = `${fileUrl}&warehouseId=${report.warehouseId}`;
      }
      report.fileUrl = fileUrl;
    });
  }

  currentPageDataChange($event: Report[]): void {
    this.listOfDisplayReports! = $event; 
  }
 

  
  ngOnInit(): void{
    this.titleService.setTitle(this.i18n.fanyi('menu.main.report.report'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      companySpecific: [null],
      warehouseSpecific: [null],
    });

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });
    
  }

  removeCustomizedReport() : void{}

}
