import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message'; 

import { UserService } from '../../auth/services/user.service';
import { PrintPageOrientation } from '../../common/models/print-page-orientation.enum';
import { PrintPageSize } from '../../common/models/print-page-size.enum';
import { PrintingService } from '../../common/services/printing.service';
import { Inventory } from '../../inventory/models/inventory';
import { ItemService } from '../../inventory/services/item.service';
import { ReportOrientation } from '../../report/models/report-orientation.enum';
import { ReportType } from '../../report/models/report-type.enum';
import { LocationGroup } from '../../warehouse-layout/models/location-group'; 
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { QcInspectionRequest } from '../models/qc-inspection-request';
import { QcInspectionRequestType } from '../models/qc-inspection-request-type';
import { QCInspectionResult } from '../models/qc-inspection-result'; 
import { QcInspectionRequestService } from '../services/qc-inspection-request.service'; 

@Component({
    selector: 'app-qc-qc-inspection',
    templateUrl: './qc-inspection.component.html',
    styleUrls: ['./qc-inspection.component.less'],
    standalone: false
})
export class QcQcInspectionComponent implements OnInit {

   
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  validLocationGroups: LocationGroup[] = [];
  // Form related data and functions
  searchForm!: UntypedFormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';
  qcInspectionByInventory = new Map();

  displayOnly = false;
  constructor(  
    private fb: UntypedFormBuilder, 
    private messageService: NzMessageService, 
    private userService: UserService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private locationService: LocationService,
    private itemService: ItemService, 
    private qcInspectionRequestService: QcInspectionRequestService, 
    private locationGroupService: LocationGroupService,
    private printingService: PrintingService,
    ) { 

      userService.isCurrentPageDisplayOnly("/qc/inspection").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );      
  }

  listOfQCRequiredInventory: Inventory[] = [];
  listOfQCInspectionRequest: QcInspectionRequest[] = [];

  qcInspectionRequestTypes = QcInspectionRequestType;
  qcInspectionRequestTypesKeys = Object.keys(this.qcInspectionRequestTypes);
  qcInspectionResults = QCInspectionResult;
  qcInspectionResultsKeys = Object.keys(this.qcInspectionResults);
    

  ngOnInit(): void { 

    this.searchForm = this.fb.group({ 
     // locationGroups: [null], 
     // locationName: [null], 
      number: [null], 
      lpn: [null], 
      // itemName: [null], 
      // qcInspectionRequestType: [QcInspectionRequestType.BY_INVENTORY],
      // qcInspectionResult: [QCInspectionResult.PENDING]
      qcInspectionRequestType: [null],
      qcInspectionResult: [null]
    }); 

    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['number'] || params['type'] || params['result']) { 

        this.searchForm!.value.number.setValue(params['number'] ? params['number'] : "");
        this.searchForm!.value.qcInspectionRequestType.setValue(params['type'] ? params['type'] : "");
        this.searchForm!.value.qcInspectionResult.setValue(params['result'] ? params['result']  : "");
        this.search();
      } 
    });

    this.loadQCLocationGroups();
    
  }
  
  loadQCLocationGroups() {

    this.locationGroupService.getQCLocationGroups().subscribe({
        next:  (locationGroups: LocationGroup[]) =>  this.validLocationGroups = locationGroups
      });
  }
  

  resetForm(): void {
    this.searchForm.reset(); 
    this.listOfQCInspectionRequest = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = ''; 
    console.log(`this.searchForm.controls.qcInspectionRequestType.value: ${this.searchForm.value.qcInspectionRequestType.value}`) 

      this.qcInspectionRequestService.getQCInspectionRequests(
        undefined, undefined,
        this.searchForm.value.lpn.value,
        this.searchForm.value.number.value, 
        this.searchForm.value.qcInspectionRequestType.value,
        this.searchForm.value.qcInspectionResult.value).subscribe(
        {
          next: (qcInspectionRequestRes) => {
            this.listOfQCInspectionRequest = qcInspectionRequestRes; 
  
            this.isSpinning = false;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
                currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
                rowCount: qcInspectionRequestRes.length,
                });
          }, 
          error: () => this.isSpinning = false
        }); 
/**
 * this.qcInspectionService.getQCRequiredInventory(
      undefined, 
      this.searchForm.controls.locationName.value,
      this.searchForm.controls.locationGroups.value,
      undefined, 
      this.searchForm.controls.itemName.value).subscribe(
      {
        next: (inventoryRes) => {
          this.listOfQCRequiredInventory = inventoryRes;
          this.loadQCInspectionByInventory();

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: inventoryRes.length,
              });
        }, 
        error: () => this.isSpinning = false
      });
 * 
 */

      
  }
  isQCRequired(qcInspectionRequest: QcInspectionRequest) : boolean {

    return qcInspectionRequest.qcInspectionResult === QCInspectionResult.PENDING;

  }
  loadQCInspectionByInventory() {
    let inventoryIds = this.listOfQCRequiredInventory.map(
      inventory => inventory.id!
    ).join(",")
    this.qcInspectionRequestService.getQCInspectionRequests(
      undefined,inventoryIds
    ).subscribe(
      {
        next: (qcInspectionRequestRes) => {
          qcInspectionRequestRes.forEach(
            qcInspectionRequest => 
              this.qcInspectionByInventory.set(
                qcInspectionRequest.inventory!.id!, qcInspectionRequest
              )
          );
        }
      }
    )
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
 
 //   {
 //     title: 'qc-inspection',
 //     renderTitle: 'qcInspectionColumnTitle' ,
 //     render: 'qcInspectionColumn',
 //   },
    { title: this.i18n.fanyi("number"), index: 'number' }, 
    { title: this.i18n.fanyi("lpn"), index: 'inventory.lpn', iif: () => this.isChoose('lpn') }, 
    // { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName') },
    { title: this.i18n.fanyi("item"), 
       render: 'itemNameColumn', iif: () => this.isChoose('itemName') },
    { title: this.i18n.fanyi("item.description"), 
        render: 'itemDescriptionColumn',    iif: () => this.isChoose('itemDescription') },
    { title: this.i18n.fanyi("work-order"), index: 'workOrder.number', iif: () => this.isChoose('workOrder') },
    { title: this.i18n.fanyi("inventory-quantity"), index: 'inventory.quantity', iif: () => this.isChoose('quantity') },
    { title: this.i18n.fanyi("location-group"), index: 'inventory.location.locationGroup.name', iif: () => this.isChoose('locationGroup') },
    { title: this.i18n.fanyi("location"), index: 'inventory.location.name', iif: () => this.isChoose('location') },
    { title: this.i18n.fanyi("inventory-status"), index: 'inventory.inventoryStatus.name', iif: () => this.isChoose('inventoryStatus') },
    { title: this.i18n.fanyi("qc-required"), index: 'inboundQCRequired', iif: () => this.isChoose('inboundQCRequired') }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle' ,
      render: 'actionColumn',fixed: 'right',width: 350, 
      iif: () => !this.displayOnly
    },

  ];
  customColumns = [
  
    { label: this.i18n.fanyi("lpn"), value: 'lpn', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true },
    { label: this.i18n.fanyi("work-order"), value: 'workOrder', checked: true },
    { label: this.i18n.fanyi("quantity"), value: 'quantity', checked: true },
    { label: this.i18n.fanyi("location-group"), value: 'locationGroup', checked: true },
    { label: this.i18n.fanyi("location"), value: 'location', checked: true },
    { label: this.i18n.fanyi("inventory-status"), value: 'inventoryStatus', checked: true },
    { label: this.i18n.fanyi("qc-required"), value: 'inboundQCRequired', checked: true },

  ];

  isChoose(key: string): boolean {
      return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
        this.st!.resetColumns({ emitReload: true });

    }
  }

  processItemQueryResult(selectedItemName: any): void {
    console.log(`start to query with location name ${selectedItemName}`);
    this.itemService.getItems(selectedItemName).subscribe(
      {
        next: (itemsRes) => {
          if (itemsRes.length === 1) { 
            this.searchForm.value.itemName.setValue(itemsRes[0].name); 
          }
        }
      }
    )
    
  } 
  processLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.locationService.getLocations(undefined, undefined, selectedLocationName).subscribe(
      {
        next: (locationRes) => {
          if (locationRes.length === 1) {
            this.searchForm.value.locationName.setValue(locationRes[0].name); 
          }
        }
      }
    )
    
  } 
  processQCInspection(qcInspectionRequest: QcInspectionRequest) {
    // console.log(`start to process qc inspection for ${qcInspectionRequest.number}`);
    switch (qcInspectionRequest.type) {
      case QcInspectionRequestType.BY_INVENTORY: {
        this.router.navigateByUrl(
          `/qc/inspect-inventory?ids=${qcInspectionRequest.inventory?.id}`);
          break;
      }
      case QcInspectionRequestType.BY_ITEM: {
        
        this.router.navigateByUrl(
          `/qc/inspect-by-request?ids=${qcInspectionRequest.id}`);
          break;
      }

    }

  }

  processQCInspectionForSelectedInventory(){
    const selectedInventoryIds : string = 
        this.getSelectedInventory().join(",");

    
    this.router.navigateByUrl(
          `/qc/inspect-inventory?ids=${selectedInventoryIds}`);

  }

  getSelectedInventory() : number[] {
    return this.st._data.filter(item => item.checked).map(item => item['id']); 
  }

  
  printQCInspectionRequestReport(event: any, qcInspectionRequest: QcInspectionRequest) {

    this.isSpinning = true;

    console.log(`start to print qc inspection request report for  \n${qcInspectionRequest.number}`);
    this.qcInspectionRequestService.generateQCInspectionRequestReport(
      qcInspectionRequest.id!)
      .subscribe(printResult => {

        // send the result to the printer
        // const printFileUrl
        //   = `${environment.api.baseUrl}/resource/report-histories/download/${printResult.fileName}`;
        // console.log(`will print file: ${printFileUrl}`);
        this.printingService.printFileByName(
          "LPN Label",
          printResult.fileName,
          ReportType.LPN_REPORT,
          event.printerIndex,
          event.printerName,
          event.physicalCopyCount,
          PrintPageOrientation.Landscape,
          PrintPageSize.A4,
          qcInspectionRequest.number, 
          printResult, event.collated);
        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi("report.print.printed"));
      },
        () => {
          this.isSpinning = false;
        },

      );

  }
  previewQCInspectionRequestReport(qcInspectionRequest: QcInspectionRequest): void {


    this.isSpinning = true;
    this.qcInspectionRequestService.generateQCInspectionRequestReport(
      qcInspectionRequest.id!)
      .subscribe(printResult => {
        // console.log(`Print success! result: ${JSON.stringify(printResult)}`);
        this.isSpinning = false;
        this.router.navigateByUrl(`/report/report-preview?type=${printResult.type}&fileName=${printResult.fileName}&orientation=${ReportOrientation.LANDSCAPE}`);

      },
        () => {
          this.isSpinning = false;
        },
      );
  }
  
}
