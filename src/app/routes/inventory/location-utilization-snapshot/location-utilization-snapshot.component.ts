import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service'; 
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
    standalone: false
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
    { title: this.i18n.fanyi("netVolume"),  
    render: 'netVolumeColum',
    iif: () => this.isChoose('netVolume')  }, 
    { title: this.i18n.fanyi("grossVolume"),  
    render: 'grossVolumeColum',
    iif: () => this.isChoose('grossVolume')  }, 
    { title: this.i18n.fanyi("totalLocations"),  index: 'totalLocations' , 
    iif: () => this.isChoose('totalLocations')  }, 
    { title: this.i18n.fanyi("totalLPNs"),  index: 'totalLPNs' , 
    iif: () => this.isChoose('totalLPNs')  }, 
    { title: this.i18n.fanyi("startTime"),  
    render: 'startTimeColumn',
    iif: () => this.isChoose('startTime')  }, 
    { title: this.i18n.fanyi("completeTime"),  
    render: 'completeTimeColumn',
    iif: () => this.isChoose('completeTime')  },  
    { title: this.i18n.fanyi("action"),  
    render: 'actionColumn', 
    iif: () => !this.displayOnly}
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("status"), value: 'status', checked: true },
    { label: this.i18n.fanyi("netVolume"), value: 'netVolume', checked: true },
    { label: this.i18n.fanyi("grossVolume"), value: 'grossVolume', checked: true },
    { label: this.i18n.fanyi("totalLocations"), value: 'totalLocations', checked: true },
    { label: this.i18n.fanyi("totalLPNs"), value: 'totalLPNs', checked: true },
    { label: this.i18n.fanyi("startTime"), value: 'startTime', checked: true },      
    { label: this.i18n.fanyi("completeTime"), value: 'completeTime', checked: true },      
    
  ];

 
  searchForm!: UntypedFormGroup;
  locationUtilizationSnapshotBatches: LocationUtilizationSnapshotBatch[] = [];
  searchResult = "";

  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private locationUtilizationSnapshotBatchService: LocationUtilizationSnapshotBatchService,
    private messageService: NzMessageService, 
    private fb: UntypedFormBuilder, 
    private localCacheService: LocalCacheService,
    private userService: UserService,) { 
      userService.isCurrentPageDisplayOnly("/inventory/location-utilization-snapshot").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );              
    
    }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      status: [null],
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params['number']) { 
        this.searchForm!.value.number.setValue(params['number']);
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
        this.searchForm!.value.status.value)
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
        this.searchForm!.value.number.setValue(locationUtilizationSnapshotRes.number);
        this.isSpinning = false;
        this.search();
      } ,
      error: () => this.isSpinning = false
    })
  }

  remove(locationUtilizationSnapshotBatch: LocationUtilizationSnapshotBatch) {
    this.isSpinning = true;
    this.locationUtilizationSnapshotBatchService.removeLocationUtilizationSnapshotBatch(locationUtilizationSnapshotBatch.id!)
    .subscribe({
      next: () => {

        this.messageService.success(this.i18n.fanyi("message.action.success"));
        this.isSpinning=false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    })


  }
}
