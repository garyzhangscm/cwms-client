import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange, STData } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, User, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { UserService } from '../../auth/services/user.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { InventoryConfiguration } from '../../inventory/models/inventory-configuration';
import { InventoryConfigurationService } from '../../inventory/services/inventory-configuration.service';
import { InventoryService } from '../../inventory/services/inventory.service';
import { PickGroupType } from '../../outbound/models/pick-group-type.enum';
import { PickStatus } from '../../outbound/models/pick-status.enum';
import { PickWork } from '../../outbound/models/pick-work';
import { Shipment } from '../../outbound/models/shipment';
import { ShipmentLine } from '../../outbound/models/shipment-line';
import { ShipmentStatus } from '../../outbound/models/shipment-status.enum';
import { ShortAllocation } from '../../outbound/models/short-allocation';
import { ShortAllocationStatus } from '../../outbound/models/short-allocation-status.enum';
import { Wave } from '../../outbound/models/wave';
import { WaveStatus } from '../../outbound/models/wave-status.enum';
import { BulkPickService } from '../../outbound/services/bulk-pick.service';
import { PickListService } from '../../outbound/services/pick-list.service';
import { PickService } from '../../outbound/services/pick.service';
import { ShipmentLineService } from '../../outbound/services/shipment-line.service';
import { ShortAllocationService } from '../../outbound/services/short-allocation.service';
import { WaveService } from '../../outbound/services/wave.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { WebPageTableColumnConfiguration } from '../../util/models/web-page-table-column-configuration';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WorkTaskService } from '../../work-task/services/work-task.service';
import { WorkOrderFlow } from '../models/work-order-flow';
import { WorkOrderFlowLine } from '../models/work-order-flow-line';
import { WorkOrderFlowService } from '../services/work-order-flow.service';

@Component({
    selector: 'app-work-order-work-order-flow',
    templateUrl: './work-order-flow.component.html',
    standalone: false
})
export class WorkOrderWorkOrderFlowComponent implements OnInit {

  pageName = "work-order-flow";
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 

  // Table data for display
  workOrderFlows: WorkOrderFlow[] = [];   
 

  @ViewChild('workOrderFlowTableColumns', { static: false })
  workOrderFlowTable!: STComponent;
  workOrderFlowTableColumns : STColumn[] = [];
  defaultWorkOrderFlowTableColumns: {[key: string]: STColumn } = {

    "name" : { title: this.i18n.fanyi("name"), index: 'name' , width: 150, 
      sort: {
        compare: (a, b) => a.name.localeCompare(b.name)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.name === filter.value,
        multiple: true
      }
    },   
    "description" : { title: this.i18n.fanyi("description"), index: 'description' , width: 150, 
      sort: {
        compare: (a, b) => a.description.localeCompare(b.description)
      }, 
    },   
  }; 

  @ViewChild('workOrderFlowLineTable', { static: false })
  workOrderFlowLineTable!: STComponent;
  workOrderFlowLineTableColumns : STColumn[] = [];
  defaultWorkOrderFlowLineTableColumns: {[key: string]: STColumn } = {

    "work-order-number" : { title: this.i18n.fanyi("work-order.number"), index: 'workOrder.number' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.workOrder.number,b.workOrder.number)
      },
      filter: {
        menus:  [] ,
        fn: (filter, record) => record.workOrder.number === filter.value,
        multiple: true
      }
    },   
    "sequence" : { title: this.i18n.fanyi("sequence"), index: 'sequence' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableNumber(a.sequence,b.sequence)
      }, 
    },   
  };  
   
  // Form related data and functions
  searchForm!: UntypedFormGroup; 
  searching = false;
  searchResult = '';  


  isSpinning = false;

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private workOrderFlowService: WorkOrderFlowService,  
    private companyService: CompanyService,
    private messageService: NzMessageService,
    private userService: UserService,
    private router: Router, 
    private utilService: UtilService,  
    private localCacheService: LocalCacheService,
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/work-order-flow").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );           
    

    this.initWebPageTableColumnConfiguration();
  }
  
  ngOnInit(): void {
   // this.titleService.setTitle(this.i18n.fanyi('menu.main.outbound.wave'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      description: [null], 
    }); 
  }

  initWebPageTableColumnConfiguration() {
    this.initWorkOrderFlowTableColumnConfiguration();
    this.initWorkOrderFlowLineTableColumnConfiguration();
  }
  
  initWorkOrderFlowTableColumnConfiguration() { 
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "workOrderFlowTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["workOrderFlowTable"] = webPageTableColumnConfigurationRes;
          this.refreshWorkOrderFlowTableColumns();

        }
        else {
          this.tableConfigurations["workOrderFlowTable"] = this.getDefaultWorkOrderFlowTableColumnsConfiguration();
          this.refreshWorkOrderFlowTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["workOrderFlowTable"] = this.getDefaultWorkOrderFlowTableColumnsConfiguration();
        this.refreshWorkOrderFlowTableColumns();
      }
    })
  }

  refreshWorkOrderFlowTableColumns() {
    
      if (this.tableConfigurations["workOrderFlowTable"] == null) {
        return;
      }
      // this.waveTableColumns =  this.defaultWaveTableColumns;
      this.workOrderFlowTableColumns = [
        { title: '', index: 'name', type: 'checkbox' },
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let workOrderFlowTableConfiguration = this.tableConfigurations["workOrderFlowTable"].filter(
        column => column.displayFlag
      );

      workOrderFlowTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      workOrderFlowTableConfiguration.forEach(
        columnConfig => {
          this.defaultWorkOrderFlowTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.workOrderFlowTableColumns = [...this.workOrderFlowTableColumns, 
            this.defaultWorkOrderFlowTableColumns[columnConfig.columnName]
          ]
        }
      )

      this.workOrderFlowTableColumns = [...this.workOrderFlowTableColumns,  
        {
          title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
          render: 'actionColumn',
          iif: () => !this.displayOnly
        }, 
      ];
 
      if (this.workOrderFlowTable != null) {

        this.workOrderFlowTable.resetColumns({ emitReload: true });
      } 


  }
  
  getDefaultWorkOrderFlowTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "workOrderFlowTable",
        columnName: "name",
        columnDisplayText: this.i18n.fanyi("name"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "workOrderFlowTable",
        columnName: "description",
        columnDisplayText: this.i18n.fanyi("description"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      }, 
       
    ]
  } 

  workOrderFlowTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["workOrderFlowTable"] = tableColumnConfigurationList;
      this.refreshWorkOrderFlowTableColumns();
  }

  
  initWorkOrderFlowLineTableColumnConfiguration() { 
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "workOrderFlowLineTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["workOrderFlowLineTable"] = webPageTableColumnConfigurationRes;
          this.refreshWorkOrderFlowLineTableColumns();

        }
        else {
          this.tableConfigurations["workOrderFlowLineTable"] = this.getDefaultWorkOrderFlowLineTableColumnsConfiguration();
          this.refreshWorkOrderFlowLineTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["workOrderFlowLineTable"] = this.getDefaultWorkOrderFlowLineTableColumnsConfiguration();
        this.refreshWorkOrderFlowLineTableColumns();
      }
    })
  }

  refreshWorkOrderFlowLineTableColumns() {
    
      if (this.tableConfigurations["workOrderFlowLineTable"] == null) {
        return;
      }
      // this.waveTableColumns =  this.defaultWaveTableColumns;
      this.workOrderFlowTableColumns = [ 
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let workOrderFlowLineTableConfiguration = this.tableConfigurations["workOrderFlowLineTable"].filter(
        column => column.displayFlag
      );

      workOrderFlowLineTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      workOrderFlowLineTableConfiguration.forEach(
        columnConfig => {
          this.defaultWorkOrderFlowLineTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.workOrderFlowLineTableColumns = [...this.workOrderFlowLineTableColumns, 
            this.defaultWorkOrderFlowLineTableColumns[columnConfig.columnName]
          ]
        }
      )

      this.workOrderFlowLineTableColumns = [...this.workOrderFlowLineTableColumns,  
        {
          title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
          render: 'actionColumn',
          iif: () => !this.displayOnly
        }, 
      ];
 
      if (this.workOrderFlowLineTable != null) {

        this.workOrderFlowLineTable.resetColumns({ emitReload: true });
      } 


  }
  
  getDefaultWorkOrderFlowLineTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "workOrderFlowLineTable",
        columnName: "work-order-number",
        columnDisplayText: this.i18n.fanyi("work-order.number"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "workOrderFlowLineTable",
        columnName: "sequence",
        columnDisplayText: this.i18n.fanyi("sequence"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      }, 
       
    ]
  } 

  workOrderFlowLineTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["workOrderFlowLineTable"] = tableColumnConfigurationList;
      this.refreshWorkOrderFlowLineTableColumns();
  }

  

  resetForm(): void {
    this.searchForm.reset();
    this.workOrderFlows = []; 
  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.workOrderFlowService.getWorkOrderFlows(this.searchForm.controls.name.value, 
      this.searchForm.controls.description.value, 
      ).subscribe({
        next: (workOrderFlowRes) => {
          this.workOrderFlows = workOrderFlowRes;
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: workOrderFlowRes.length,
          });

        }, 
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';

        }
      }); 
  }
 
  workOrderFlowTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      // console.log(`expanded: ${event.expand.id}`)
      this.showWorkOrderFlowDetails(event.expand);
    }

  } 

  showWorkOrderFlowDetails(workOrderFlow: WorkOrderFlow): void { 
    
  }    

  deassignWorkOrder(workOrderFlow: WorkOrderFlow, workOrderFlowLine: WorkOrderFlowLine): void { }
    


}
