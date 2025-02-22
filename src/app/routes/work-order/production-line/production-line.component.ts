import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { UserService } from '../../auth/services/user.service'; 
import { WebPageTableColumnConfiguration } from '../../util/models/web-page-table-column-configuration';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service'; 
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { ProductionLine } from '../models/production-line';
import { ProductionLineAssignment } from '../models/production-line-assignment';
import { ProductionLineCapacity } from '../models/production-line-capacity';
import { ProductionLineType } from '../models/production-line-type';
import { ProductionLineAssignmentService } from '../services/production-line-assignment.service';
import { ProductionLineTypeService } from '../services/production-line-type.service';
import { ProductionLineService } from '../services/production-line.service';

@Component({
    selector: 'app-work-order-production-line',
    templateUrl: './production-line.component.html',
    styleUrls: ['./production-line.component.less'],
    standalone: false
})
export class WorkOrderProductionLineComponent implements OnInit {

  private i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  pageName = "productionLine";
  loadingProductionLineDetailsRequest = 0;
  tableConfigurations: {[key: string]: WebPageTableColumnConfiguration[] } = {}; 
 
  productionLineTableColumns : STColumn[] = [];
  @ViewChild('productionLineTable', { static: false })
  productionLineTable!: STComponent;
  defaultProductionLineTableColumns: {[key: string]: STColumn } = {

    "name" : { title: this.i18n.fanyi("production-line.name"), index: 'name' , width: 150, 
      sort: {
        compare: (a, b) => a.name.localeCompare(b.name)
      }, 
    },   
    "type" : { title: this.i18n.fanyi("production-line-type"), index: 'type.name' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.type?.name, b.type?.name)
      }, 
    },  
    "location" : { title: this.i18n.fanyi("production-line.location"), render: 'locationColumn', width: 150,  
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.productionLineLocation?.name, b.productionLineLocation?.name)
      }, 
    },   
    "inboundStageLocation" : { title: this.i18n.fanyi("production-line.inbound-stage-location"), 
    render: 'inboundStageLocationColumn', width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.inboundStageLocation?.name, b.inboundStageLocation?.name)
      },
    },  
    "outboundStageLocation" : { title: this.i18n.fanyi("production-line.outbound-stage-location"), 
    render: 'outboundStageLocationColumn', width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.outboundStageLocation?.name, b.outboundStageLocation?.name)
      },
    },  
    "singleWorkOrderOnly" : { title: this.i18n.fanyi("single-work-order-only"), index: 'workOrderExclusiveFlag' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareBoolean(a.workOrderExclusiveFlag, b.workOrderExclusiveFlag),
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true },
          { text: this.i18n.fanyi('no'), value: false },
        ] ,
        fn: (filter, record) => record.status === filter.value,
        multiple: true
      }
    },  
    "reportPrinter" : { title: this.i18n.fanyi("report-printer"), index: 'reportPrinterName' , width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.reportPrinterName, b.reportPrinterName)
      },
    },  
    // { title: this.i18n.fanyi("assign"), render: 'assignColumn'  },  
    // { title: this.i18n.fanyi("currentUser"), index: 'workTask.currentUser.username'  },  
    "labelPrinter" : { title: this.i18n.fanyi("label-printer"), index: 'labelPrinterName', width: 150 , 
      sort: {
        compare: (a, b) => this.utilService.compareNullableString(a.labelPrinterName, b.labelPrinterName)
      },
    },  
    "enabled" : { title: this.i18n.fanyi("enabled"), index: 'enabled', width: 150 , 
      sort: {
        compare: (a, b) => this.utilService.compareBoolean(a.enabled, b.enabled)
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true },
          { text: this.i18n.fanyi('no'), value: false },
        ] ,
        fn: (filter, record) => record.status === filter.value,
        multiple: true
      }
    },  
    "genericPurpose" : { title: this.i18n.fanyi("production-line.generic-purpose"), index: 'genericPurpose', width: 150, 
      sort: {
        compare: (a, b) => this.utilService.compareBoolean(a.genericPurpose, b.genericPurpose),
      },
      filter: {
        menus:  [
          { text: this.i18n.fanyi('yes'), value: true },
          { text: this.i18n.fanyi('no'), value: false },
        ] ,
        fn: (filter, record) => record.status === filter.value,
        multiple: true
      }
    },     
   
  };
   
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  searchResult = '';

  isSpinning = false;
  // Table data for display
  listOfAllProductionLine: ProductionLine[] = []; 
 
  availableProductionLineTypes: ProductionLineType[] = [];
  

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private productionLineService: ProductionLineService,
    private messageService: NzMessageService,
    private utilService: UtilService,
    private userService: UserService,
    private locationService: LocationService,
    private companyService: CompanyService,
    private activatedRoute: ActivatedRoute,
    private productionLineAssignmentService: ProductionLineAssignmentService,
    private localCacheService: LocalCacheService,
    private productionLineTypeService: ProductionLineTypeService,
  ) {
    userService.isCurrentPageDisplayOnly("/work-order/production-line").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                       
   }

   ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      type: [null],
    });


    this.activatedRoute.queryParams.subscribe(params => {
      if (params['name']) {
        this.searchForm.value.name.setValue(params['name']);
        this.search();
      }
    });

    this.loadAvailableProductionLineTypes();
    this.initWebPageTableColumnConfiguration();

  }
  
  initWebPageTableColumnConfiguration() {
    this.initProductionLineTableColumnConfiguration();
  }
  
  initProductionLineTableColumnConfiguration() {
    // console.log(`start to init wave table columns`);
    this.localCacheService.getWebPageTableColumnConfiguration(this.pageName, "productionLineTable")
    .subscribe({
      next: (webPageTableColumnConfigurationRes) => {
        
        if (webPageTableColumnConfigurationRes && webPageTableColumnConfigurationRes.length > 0){

          this.tableConfigurations["productionLineTable"] = webPageTableColumnConfigurationRes;
          this.refreshProductionLineTableColumns();

        }
        else {
          this.tableConfigurations["productionLineTable"] = this.getDefaultProductionLineTableColumnsConfiguration();
          this.refreshProductionLineTableColumns();
        }
      }, 
      error: () => {
        
        this.tableConfigurations["productionLineTable"] = this.getDefaultProductionLineTableColumnsConfiguration();
        this.refreshProductionLineTableColumns();
      }
    })
  }

  refreshProductionLineTableColumns() {
    
      // this.waveTableColumns =  this.defaultWaveTableColumns;
      this.productionLineTableColumns = [ 
      ];

      // loop through the table column configuration and add
      // the column if the display flag is checked, and by sequence
      let productionLineTableConfiguration = this.tableConfigurations["productionLineTable"].filter(
        column => column.displayFlag
      );

      productionLineTableConfiguration.sort((a, b) => a.columnSequence - b.columnSequence);

      productionLineTableConfiguration.forEach(
        columnConfig => {
          this.defaultProductionLineTableColumns[columnConfig.columnName].title = columnConfig.columnDisplayText;

          this.productionLineTableColumns = [...this.productionLineTableColumns, 
            this.defaultProductionLineTableColumns[columnConfig.columnName]
          ]
        }
      )

      this.productionLineTableColumns = [...this.productionLineTableColumns,  
        {
          title: this.i18n.fanyi("action"), fixed: 'right', width: 210, 
          render: 'actionColumn',
          iif: () => !this.displayOnly
        }, 
      ]; 

      this.productionLineTable.resetColumns({ emitReload: true }); 
  }

  getDefaultProductionLineTableColumnsConfiguration(): WebPageTableColumnConfiguration[] {
    
    return [
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "name",
        columnDisplayText: this.i18n.fanyi("production-line.name"),
        columnWidth: 150,
        columnSequence: 1, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "type",
        columnDisplayText: this.i18n.fanyi("production-line-type"),
        columnWidth: 150,
        columnSequence: 2, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "location",
        columnDisplayText: this.i18n.fanyi("production-line.location"),
        columnWidth: 150,
        columnSequence: 3, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "inboundStageLocation",
        columnDisplayText: this.i18n.fanyi("production-line.inbound-stage-location"),
        columnWidth: 150,
        columnSequence: 4, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "outboundStageLocation",
        columnDisplayText: this.i18n.fanyi("production-line.outbound-stage-location"),
        columnWidth: 150,
        columnSequence: 5, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "singleWorkOrderOnly",
        columnDisplayText: this.i18n.fanyi("single-work-order-only"),
        columnWidth: 150,
        columnSequence: 6, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "reportPrinter",
        columnDisplayText: this.i18n.fanyi("report-printer"),
        columnWidth: 150,
        columnSequence: 7, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "labelPrinter",
        columnDisplayText: this.i18n.fanyi("label-printer"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      },
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "enabled",
        columnDisplayText: this.i18n.fanyi("enabled"),
        columnWidth: 150,
        columnSequence: 8, 
        displayFlag: true
      }, 
      {
        companyId: this.companyService.getCurrentCompany()!.id, 
        webPageName: this.pageName,
        tableName: "productionLineTable",
        columnName: "genericPurpose",
        columnDisplayText: this.i18n.fanyi("genericPurpose"),
        columnWidth: 150,
        columnSequence: 9, 
        displayFlag: true
      },     
    ]
  } 

  productionLineTableColumnConfigurationChanged(tableColumnConfigurationList: WebPageTableColumnConfiguration[]){
      // console.log(`new wave table column configuration list ${tableColumnConfigurationList.length}`)
      // tableColumnConfigurationList.forEach(
      //   column => {
      //     console.log(`${JSON.stringify(column)}`)
      //   }
      // )
      this.tableConfigurations["productionLine"] = tableColumnConfigurationList;
      this.refreshProductionLineTableColumns();
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllProductionLine = []; 

  } 
  loadAvailableProductionLineTypes() : void {
    this.productionLineTypeService.getProductionLineTypes().subscribe({
      next: (productionLineTypeRes) => this.availableProductionLineTypes = productionLineTypeRes
    })
  }

  showProductionLineDetails(productionLine: ProductionLine) : void {
    if (productionLine.productionLineAssignments != null && productionLine.productionLineAssignments.length > 0) {
      // if we already have the production assignment setup, then skip
      return;
    }
    this.isSpinning = true;
    this.productionLineAssignmentService.getProductionLineAssignments(productionLine.id!)
    .subscribe({
      next: (productionLineAssignmentsRes) => {
        productionLine.productionLineAssignments = productionLineAssignmentsRes; 
        this.isSpinning = false;

        productionLine.productionLineAssignments.filter(
          productionLineAssignment => productionLineAssignment.workOrderItemId != null
        ).forEach(
          productionLineAssignment => {
            this.localCacheService.getItem(productionLineAssignment.workOrderItemId!).subscribe(
              {
                next: (itemRes) => {
                  productionLineAssignment.workOrderItemName = itemRes.name; 
                }, 
              }
            )
          }
        )
        
      }, 
      error: () => this.isSpinning = false
    })
  }
  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
    this.productionLineService.getProductionLines(
      this.searchForm.value.name.value,
      this.searchForm.value.type.value, 
      false, false).subscribe({
        next: (productionLineRes) => {
          this.listOfAllProductionLine = productionLineRes;  
          this.refreshDetailInformations(this.listOfAllProductionLine);
  
          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: productionLineRes.length,
          });
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
      }) ;
  } 

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  async refreshDetailInformations(productionLines: ProductionLine[]) {

    let index = 0;
    this.loadingProductionLineDetailsRequest = 0;
    while (index < productionLines.length) {

      // we will need to make sure we are at max loading detail information
      // for 10 orders at a time(each order may have 5 different request). 
      // we will get error if we flush requests for
      // too many orders into the server at a time
      // console.log(`1. this.loadingOrderDetailsRequest: ${this.loadingOrderDetailsRequest}`);
      
      
      while(this.loadingProductionLineDetailsRequest > 50) {
        // sleep 50ms        
        await this.delay(50);
      } 
      
      this.refreshDetailInformation(productionLines[index]);
      index++;
    } 
    while(this.loadingProductionLineDetailsRequest > 0) {
      // sleep 50ms        
      await this.delay(100);
    }  
    // refresh the table while everything is loaded
    // console.log(`mnaually refresh the table`);   
    this.productionLineTable.reload();  
  }
  
  refreshDetailInformation(productionLine: ProductionLine): void {
    
    //this.loadClient(productionLine); 
    this.loadProductionLineLocation(productionLine);
    this.loadProductionLineInboundStageLocation(productionLine);
    this.loadProductionLineOutboundStageLocation(productionLine);
    

  }

  loadProductionLineLocation(productionLine: ProductionLine) {
     
    if (productionLine.productionLineLocationId && productionLine.productionLineLocation == null) {
      this.loadingProductionLineDetailsRequest++;
      this.localCacheService.getLocation(productionLine.productionLineLocationId).subscribe(
        {
          next: (res) => {
            productionLine.productionLineLocation = res;
            this.loadingProductionLineDetailsRequest--;
          }, 
          error: () => this.loadingProductionLineDetailsRequest--
        }
      );      
    } 
  }
  loadProductionLineInboundStageLocation(productionLine: ProductionLine) {
     
    if (productionLine.inboundStageLocationId && productionLine.inboundStageLocation == null) {
      this.loadingProductionLineDetailsRequest++;
      this.localCacheService.getLocation(productionLine.inboundStageLocationId).subscribe(
        {
          next: (res) => {
            productionLine.inboundStageLocation = res;
            this.loadingProductionLineDetailsRequest--;
          }, 
          error: () => this.loadingProductionLineDetailsRequest--
        }
      );      
    } 
  }
  
  loadProductionLineOutboundStageLocation(productionLine: ProductionLine) {
     
    if (productionLine.outboundStageLocationId && productionLine.outboundStageLocation == null) {
      this.loadingProductionLineDetailsRequest++;
      this.localCacheService.getLocation(productionLine.outboundStageLocationId).subscribe(
        {
          next: (res) => {
            productionLine.outboundStageLocation = res;
            this.loadingProductionLineDetailsRequest--;
          }, 
          error: () => this.loadingProductionLineDetailsRequest--
        }
      );      
    } 
  }

  loadCapacitiesInformation(productionLine: ProductionLine) { 
    productionLine.productionLineCapacities.forEach(
      capacity => this.loadCapacityInformation(capacity)
    )
  }
  
  loadCapacityInformation(productionLineCapacity: ProductionLineCapacity) {
    this.loadCapacityItemInformation(productionLineCapacity);
    this.loadCapacityUnitOfMeasureInformation(productionLineCapacity);
  }

  loadCapacityItemInformation(productionLineCapacity: ProductionLineCapacity) {
     
    if (productionLineCapacity.itemId && productionLineCapacity.item == null) { 
      this.localCacheService.getItem(productionLineCapacity.itemId).subscribe(
        {
          next: (res) => {
            productionLineCapacity.item = res; 
          },  
        }
      );      
    } 
  }
  
  loadCapacityUnitOfMeasureInformation(productionLineCapacity: ProductionLineCapacity) {
     
    if (productionLineCapacity.unitOfMeasureId && productionLineCapacity.unitOfMeasure == null) { 
      this.localCacheService.getUnitOfMeasure(productionLineCapacity.unitOfMeasureId).subscribe(
        {
          next: (res) => {
            productionLineCapacity.unitOfMeasure = res; 
          },  
        }
      );      
    } 
  }
  
  loadProductionLineAssignmentInformation(productionLine: ProductionLine) {
     
    if (productionLine.productionLineAssignments == null || productionLine.productionLineAssignments.length == 0) { 
      this.productionLineAssignmentService.getProductionLineAssignments(productionLine.id!).subscribe(
        {
          next: (res) => {
            productionLine.productionLineAssignments = res;
            this.loadProductionLineAssignmentItemsInformation(productionLine.productionLineAssignments); 
          },  
        }
      );      
    } 
  }
  loadProductionLineAssignmentItemsInformation(productionLineAssignments: ProductionLineAssignment[]) {
    productionLineAssignments.forEach(
      productionLineAssignment => this.loadProductionLineAssignmentItemInformation(productionLineAssignment)
    )
  }
  loadProductionLineAssignmentItemInformation(productionLineAssignment: ProductionLineAssignment) {
    
    if (productionLineAssignment.workOrderItemId != null && productionLineAssignment.workOrderItemName == null) { 
      this.localCacheService.getItem(productionLineAssignment.workOrderItemId).subscribe(
        {
          next: (res) => {
            productionLineAssignment.workOrderItemName = res.name; 
          },  
        }
      );      
    } 
  }
  
  productionLineTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showProductionDetails(event.expand);
    }

  }
  
  showProductionDetails(productionLine: ProductionLine): void {  
     
    this.loadCapacitiesInformation(productionLine);
    this.loadProductionLineAssignmentInformation(productionLine);
  }
  
  disableProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.disableProductionLine(productionLine, true).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  enableProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.disableProductionLine(productionLine, false).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }
  removeProductionLine(productionLine: ProductionLine): void {
    this.productionLineService.removeProductionLine(productionLine).subscribe(() => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      this.search();
    });
  }

/**
 *  
  startEdit(id: string): void {
    this.editCache[id].edit = true;
  }

  cancelEdit(id: string): void {
    const index = this.listOfAllProductionLine.findIndex(item => item.id === +id);
    console.log(`start to cancel edit for id: ${id} and index: ${index}`);
    this.editCache[id] = {
      data: { ...this.listOfAllProductionLine[index] },
      edit: false,
    };
  }

  saveRecord(id: string): void {
    const index = this.listOfAllProductionLine.findIndex(item => item.id === +id);

    console.log(`will save record with index: ${index}`);
    this.isSpinning = true;

    this.productionLineService.changeProductionLine(this.editCache[id].data)
      .subscribe(res => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.searchForm.controls.name.setValue(res.name);
        this.search();

        this.editCache[id].edit = false;
        this.isSpinning = false;
      },
        () => {
          this.isSpinning = true;
        });
  }

  updateEditCache(): void {
    this.listOfAllProductionLine.forEach(item => {
      this.editCache[item.id!] = {
        edit: false,
        data: { ...item }
      };
    });

  }
**/ 


}
