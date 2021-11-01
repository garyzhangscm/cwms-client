import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { Inventory } from '../../inventory/models/inventory';
import { ItemService } from '../../inventory/services/item.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { QCRule } from '../models/qc-rule';
import { QcInspectionRequestService } from '../services/qc-inspection-request.service';
import { QcInspectionService } from '../services/qc-inspection.service';

@Component({
  selector: 'app-qc-qc-inspection',
  templateUrl: './qc-inspection.component.html',
  styleUrls: ['./qc-inspection.component.less'],
})
export class QcQcInspectionComponent implements OnInit {

   
  validLocationGroups: LocationGroup[] = [];
  // Form related data and functions
  searchForm!: FormGroup;

  searching = false;
  isSpinning = false;
  searchResult = '';
  qcInspectionByInventory = new Map();

  constructor(private http: _HttpClient,    
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService, 
    private messageService: NzMessageService,
    private qcInspectionService: QcInspectionService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private locationService: LocationService,
    private itemService: ItemService,
    private locationGroupTypeService: LocationGroupTypeService,
    private qcInspectionRequestService: QcInspectionRequestService,
    private locationGroupService: LocationGroupService,
    ) { 

  }

  listOfQCRequiredInventory: Inventory[] = [];
    

  ngOnInit(): void { 

    this.searchForm = this.fb.group({ 
      locationGroups: [null], 
      locationName: [null], 
      itemName: [null], 
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
    this.listOfQCRequiredInventory = [];


  }
  
  search(): void {
    this.isSpinning = true;
    this.searchResult = ''; 

    this.qcInspectionService.getQCRequiredInventory(
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

      
  }
  loadQCInspectionByInventory() {
    let inventoryIds = this.listOfQCRequiredInventory.map(
      inventory => inventory.id!
    ).join(",")
    this.qcInspectionRequestService.getQCInspectionRequest(
      undefined,inventoryIds
    ).subscribe(
      {
        next: (qcInspectionRequestRes) => {
          qcInspectionRequestRes.forEach(
            qcInspectionRequest => 
              this.qcInspectionByInventory.set(
                qcInspectionRequest.inventory.id!, qcInspectionRequest
              )
          );
        }
      }
    )
  }

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
 
    {
      title: 'qc-inspection',
      renderTitle: 'qcInspectionColumnTitle' ,
      render: 'qcInspectionColumn',
    },
    { title: this.i18n.fanyi("lpn"), index: 'lpn', iif: () => this.isChoose('lpn') }, 
    { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName') },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', iif: () => this.isChoose('itemDescription') },
    { title: this.i18n.fanyi("quantity"), index: 'quantity', iif: () => this.isChoose('quantity') },
    { title: this.i18n.fanyi("location-group"), index: 'location.locationGroup.name', iif: () => this.isChoose('locationGroup') },
    { title: this.i18n.fanyi("location"), index: 'location.name', iif: () => this.isChoose('location') },
    { title: this.i18n.fanyi("inventory-status"), index: 'inventoryStatus.name', iif: () => this.isChoose('inventoryStatus') },
    { title: this.i18n.fanyi("qc-required"), index: 'inboundQCRequired', iif: () => this.isChoose('inboundQCRequired') },
    {
      title: 'action',
      renderTitle: 'actionColumnTitle' ,
      render: 'actionColumn',
    },

  ];
  customColumns = [
 
    { label: this.i18n.fanyi("lpn"), value: 'lpn', checked: true },
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true },
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true },
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
            this.searchForm.controls.itemName.setValue(itemsRes[0].name); 
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
            this.searchForm.controls.locationName.setValue(locationRes[0].name); 
          }
        }
      }
    )
    
  } 
  processQCInspection(inventory: Inventory) {
    console.log(`start to process qc inspection for ${inventory.lpn}`);
    this.router.navigateByUrl(
          `/qc/inspect-inventory?ids=${inventory.id}`);

  }

  processQCInspectionForSelectedInventory(){
    const selectedInventoryIds : string = 
        this.getSelectedInventory().join(",");

    
    this.router.navigateByUrl(
          `/qc/inspect-inventory?ids=${selectedInventoryIds}`);

  }

  getSelectedInventory() : number[] {
    return this.st._data.filter(item => item.checked).map(item => item.id); 
  }
  
}