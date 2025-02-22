import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AlertService } from '../../alert/services/alert.service';
import { UserService } from '../../auth/services/user.service'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { CustomReport } from '../models/custom-report';
import { WebPageTableColumnConfiguration } from '../models/web-page-table-column-configuration';
import { CustomReportService } from '../services/custom-report.service';
import { LocalCacheService } from '../services/local-cache.service';

@Component({
    selector: 'app-util-custom-report',
    templateUrl: './custom-report.component.html',
    styleUrls: ['./custom-report.component.less'],
    standalone: false
})
export class UtilCustomReportComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageName = "custom-report";
  
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 

  customReports: CustomReport[] = [];
  isCurrentUserSystemAdmin = false;

  @ViewChild('customReportTable', { static: false })
  customReportTable!: STComponent;
  customReportTableColumns : STColumn[] = [];
  defaultCustomReportTableColumns: {[key: string]: STColumn } = {

    "name" : { title: this.i18n.fanyi("name"), index: 'name' , width: 50, 
      sort: {
        compare: (a, b) => a.name.localeCompare(b.name)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.name === filter.value,
        multiple: true
      }
    },   
    "query" : { title: this.i18n.fanyi("query"), index: 'query' , width: 150, 
      sort: {
        compare: (a, b) => a.query.localeCompare(b.query)
      }, 
    },  
    "runAtCompanyLevel" : { title: this.i18n.fanyi("runAtCompanyLevel"), index: 'runAtCompanyLevel' , width: 150, 
      sort: {
        compare: (a, b) => a.runAtCompanyLevel.localeCompare(b.runAtCompanyLevel)
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true },
          { text: this.i18n.fanyi('no'), value: false },
        ] ,
        fn: (filter, record) => record.runAtCompanyLevel === filter.value,
        multiple: true
      }
    },   
   
  };

  isSpinning = false;
  
  searchForm!: UntypedFormGroup;  
  searchResult = "";

  userPermissionMap: Map<string, boolean> = new Map<string, boolean>([  
    ['execute-custom-report', false], 
  ]);
  displayOnly = false;

  constructor(private http: _HttpClient,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private messageService: NzMessageService, 
    private router: Router, 
    private customReportService: CustomReportService,
    private localCacheService: LocalCacheService,
    private companyService: CompanyService,
    private fb: UntypedFormBuilder,
    private userService: UserService) {
      
      userService.isCurrentPageDisplayOnly("/util/custom-report").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      ); 
       
      userService.getUserPermissionByWebPage("/util/custom-report").subscribe({
        next: (userPermissionRes) => {
          userPermissionRes.forEach(
            userPermission => this.userPermissionMap.set(userPermission.permission.name, userPermission.allowAccess)
          )
        }
      }); 

      userService.getCurrentUser().then(
        currentUser => this.isCurrentUserSystemAdmin = (currentUser?.systemAdmin == true)
      )

      this.initWebPageTableColumnConfiguration();
  }

  initWebPageTableColumnConfiguration() {
    this.initWaveTableColumnConfiguration();
  }
  
  initWaveTableColumnConfiguration() {
    // console.log(`start to init wave table columns`);
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "customReportTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["customReportTable"] = webPageTableColumnConfigurationRes;
          this.refreshCustomReportTableColumns();

        }
        else {
          this.tableConfigurations["customReportTable"] = this.getDefaultCustomReportTableColumnsConfiguration();
          this.refreshCustomReportTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["customReportTable"] = this.getDefaultCustomReportTableColumnsConfiguration();
        this.refreshCustomReportTableColumns();
      }
    })
  }

  refreshCustomReportTableColumns() {
    
      if (this.tableConfigurations["customReportTable"] == null) {
        return;
      } 
      this.customReportTableColumns = [ 
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let customReportTableConfiguration = this.tableConfigurations["customReportTable"].filter(
        column => column.displayFlag
      );

      customReportTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      customReportTableConfiguration.forEach(
        columnConfig => {
          this.defaultCustomReportTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.customReportTableColumns = [...this.customReportTableColumns, 
            this.defaultCustomReportTableColumns[columnConfig.columnName]
          ]
        }
      )

      this.customReportTableColumns = [...this.customReportTableColumns,  
        {
          title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
          render: 'actionColumn',
          iif: () => !this.displayOnly
        }, 
      ]; 

      if (this.customReportTable != null) {

        this.customReportTable.resetColumns({ emitReload: true });
      } 
  }
  
  getDefaultCustomReportTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "customReportTable",
        columnName: "name",
        columnDisplayText: this.i18n.fanyi("name"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "customReportTable",
        columnName: "query",
        columnDisplayText: this.i18n.fanyi("query"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "customReportTable",
        columnName: "runAtCompanyLevel",
        columnDisplayText: this.i18n.fanyi("runAtCompanyLevel"),
        columnWidth: 150,
        columnSequence: 3, 
        displayFlag: true
      },
       
    ]
  } 

  waveTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["waveTable"] = tableColumnConfigurationList;
      this.refreshCustomReportTableColumns();
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.custom-report'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null], 
    });

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) { 
        this.searchForm.value.name.setValue(params['name']);
        this.search();
      }
    });

  }
 
  resetForm(): void {
    this.searchForm.reset();
    this.customReports = []; 
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.customReportService.getCustomReports(this.searchForm.value.name.value).subscribe({
      next: (customReportRes) => {
        this.customReports = customReportRes;
        this.isSpinning = false;

        this.searchResult = this.i18n.fanyi('search_result_analysis', {
          currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
          rowCount: customReportRes.length,
        });
 
      },
      error: () => {
        this.isSpinning = false;
        this.searchResult = '';
      }
    });
  }

  removeCustomReport(id: number) {

    this.isSpinning = true;
    this.customReportService.removeCustomReport(id).subscribe({
      next: () => {
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("message.action.success"));
      }, 
      error: () => this.isSpinning = false
    })
  }
}
