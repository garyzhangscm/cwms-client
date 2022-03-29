import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { CustomerReturnOrder } from '../../inbound/models/customer-return-order';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { UtilService } from '../../util/services/util.service';
import { ClientLocationUtilizationSnapshotBatch } from '../models/client-location-utilization-snapshot-batch';
import { LocationUtilizationSnapshotBatch } from '../models/location-utilization-snapshot-batch';
import { LocationUtilizationSnapshotStatus } from '../models/location-utilization-snapshot-status.enum';
import { LocationUtilizationSnapshotBatchService } from '../services/location-utilization-snapshot-batch.service';

@Component({
  selector: 'app-inventory-location-utilization-snapshot',
  templateUrl: './location-utilization-snapshot.component.html',
  styleUrls: ['./location-utilization-snapshot.component.less'],
})
export class InventoryLocationUtilizationSnapshotComponent implements OnInit {
  isSpinning = false;
  
  locationUtilizationSnapshotStatusList = LocationUtilizationSnapshotStatus;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("status"),  index: 'status' , 
    iif: () => this.isChoose('status')  }, 
    { title: this.i18n.fanyi("netVolume"),  index: 'netVolume' , 
    iif: () => this.isChoose('netVolume')  }, 
    { title: this.i18n.fanyi("grossVolume"),  index: 'grossVolume' , 
    iif: () => this.isChoose('grossVolume')  }, 
    { title: this.i18n.fanyi("totalLocations"),  index: 'totalLocations' , 
    iif: () => this.isChoose('totalLocations')  }, 
    { title: this.i18n.fanyi("startTime"),  index: 'startTime' , 
    iif: () => this.isChoose('startTime')  }, 
    { title: this.i18n.fanyi("completeTime"),  index: 'completeTime' , 
    iif: () => this.isChoose('completeTime')  },  
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("netVolume"), value: 'netVolume', checked: true },
    { label: this.i18n.fanyi("grossVolume"), value: 'grossVolume', checked: true },
    { label: this.i18n.fanyi("totalLocations"), value: 'totalLocations', checked: true },
    { label: this.i18n.fanyi("startTime"), value: 'startTime', checked: true },      
    { label: this.i18n.fanyi("completeTime"), value: 'completeTime', checked: true },      
    
  ];

 
  searchForm!: FormGroup;
  locationUtilizationSnapshotBatches: LocationUtilizationSnapshotBatch[] = [];
  searchResult = "";

  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private locationUtilizationSnapshotBatchService: LocationUtilizationSnapshotBatchService,
    private messageService: NzMessageService, 
    private fb: FormBuilder,
    private modalService: NzModalService,   
    private titleService: TitleService,
    private utilService: UtilService,  
    private localCacheService: LocalCacheService,) { }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      status: [null],
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params.number) { 
        this.searchForm!.controls.number.setValue(params.number);
        this.search();
      } 
    });

  }
  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }
    
  resetForm(): void {
    this.searchForm.reset();
    this.locationUtilizationSnapshotBatches = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.locationUtilizationSnapshotBatchService
      .getLocationUtilizationSnapshotBatches(this.searchForm.value.number ,
        this.searchForm!.controls.status.value)
      .subscribe({

        next: (locationUtilizationSnapshotBatchesRes) => {
          this.locationUtilizationSnapshotBatches = locationUtilizationSnapshotBatchesRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationUtilizationSnapshotBatchesRes.length
          });
          this.refreshDetailInformations(this.locationUtilizationSnapshotBatches);
 
  
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   
 
  refreshDetailInformations(locationUtilizationSnapshotBatches: LocationUtilizationSnapshotBatch[]) { 
    locationUtilizationSnapshotBatches.forEach(
      locationUtilizationSnapshotBatch => this.refreshDetailInformation(locationUtilizationSnapshotBatch)
    );
  }
  refreshDetailInformation(locationUtilizationSnapshotBatch: LocationUtilizationSnapshotBatch) {
  
    locationUtilizationSnapshotBatch.clientLocationUtilizationSnapshotBatches.forEach(
      clientLocationUtilizationSnapshotBatch => this.loadClient(clientLocationUtilizationSnapshotBatch)
    )
      

      // this.loadItems(receipt);
  }

  loadClient(clientLocationUtilizationSnapshotBatch: ClientLocationUtilizationSnapshotBatch) {
     
    if (clientLocationUtilizationSnapshotBatch.clientId && clientLocationUtilizationSnapshotBatch.client == null) {
      this.localCacheService.getClient(clientLocationUtilizationSnapshotBatch.clientId).subscribe(
        {
          next: (clientRes) => clientLocationUtilizationSnapshotBatch.client = clientRes
        }
      );
      
    }
  }
 
  generateLocationUtilizationSnapshotBatch() {

    this.isSpinning = true;
    this.locationUtilizationSnapshotBatchService.generateLocationUtilizationSnapshotBatch()
    .subscribe({
      next: (locationUtilizationSnapshotRes) => {
        this.searchForm!.controls.number.setValue(locationUtilizationSnapshotRes.number);
        this.isSpinning = false;
        this.search();
      } ,
      error: () => this.isSpinning = false
    })
  }
}
