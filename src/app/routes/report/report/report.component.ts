import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { PickWork } from '../../outbound/models/pick-work';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service'; 
import { Report } from '../models/report';
import { ReportService } from '../services/report.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.less'],
})
export class ReportComponent implements OnInit {

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
          name: 'report.description',
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
          name: 'report.companyId',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableNumber(a.companyId, b.companyId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'report.warehouseId',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableNumber(a.warehouseId, b.warehouseId),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },  {
          name: 'report.type',
          showSort: true,
          sortOrder: null,
          sortFn: (a: Report, b: Report) => this.utilService.compareNullableString(a.type, b.type),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        }, {
          name: 'report.fileName',
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
 
  

  currentPageDataChange($event: Report[]): void {
    this.listOfDisplayReports! = $event; 
  }
 

  
  ngOnInit(): void{
    this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.pick'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      companySpecific: [null],
      warehouseSpecific: [null],
    });

    
  }
}
