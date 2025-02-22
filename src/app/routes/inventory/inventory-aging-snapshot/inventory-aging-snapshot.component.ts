import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { ClientInventoryAgingSnapshot } from '../models/client-inventory-aging-snapshot'; 
import { InventoryAgingSnapshot } from '../models/inventory-aging-snapshot';
import { InventoryAgingSnapshotStatus } from '../models/inventory-aging-snapshot-status'; 
import { InventoryAgingSnapshotService } from '../services/inventory-aging-snapshot.service'; 

@Component({
    selector: 'app-inventory-inventory-aging-snapshot',
    templateUrl: './inventory-aging-snapshot.component.html',
    styleUrls: ['./inventory-aging-snapshot.component.less'],
    standalone: false
})
export class InventoryInventoryAgingSnapshotComponent implements OnInit {
  isSpinning = false;
  
  inventoryAgingSnapshotStatusList = InventoryAgingSnapshotStatus;
  inventoryAgingSnapshotStatusListKeys = Object.keys(this.inventoryAgingSnapshotStatusList);

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,  }, 
    { title: this.i18n.fanyi("status"),  index: 'status' ,  },   
    { title: this.i18n.fanyi("startTime"),  
    render: 'startTimeColumn',  }, 
    { title: this.i18n.fanyi("completeTime"),  
    render: 'completeTimeColumn',  },  
    { title: this.i18n.fanyi("action"),  
    render: 'actionColumn', 
    iif: () => !this.displayOnly}
  ];  

 
  searchForm!: UntypedFormGroup;
  inventoryAgingSnapshots: InventoryAgingSnapshot[] = [];
  searchResult = "";

  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private inventoryAgingSnapshotService: InventoryAgingSnapshotService,
    private messageService: NzMessageService, 
    private fb: UntypedFormBuilder, 
    private localCacheService: LocalCacheService,
    private userService: UserService,) { 
      userService.isCurrentPageDisplayOnly("/inventory/inventory-aging-snapshot").then(
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
    
  resetForm(): void {
    this.searchForm.reset();
    this.inventoryAgingSnapshots = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.inventoryAgingSnapshotService
      .getInventoryAgingSnapshots(this.searchForm.value.number ,
        this.searchForm!.value.status.value)
      .subscribe({

        next: (inventoryAgingSnapshotRes) => {
          this.inventoryAgingSnapshots = inventoryAgingSnapshotRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryAgingSnapshotRes.length
          });
          this.refreshDetailInformations(this.inventoryAgingSnapshots);
 
  
        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   
 
  refreshDetailInformations(inventoryAgingSnapshots: InventoryAgingSnapshot[]) { 
    inventoryAgingSnapshots.forEach(
      inventoryAgingSnapshot => this.refreshDetailInformation(inventoryAgingSnapshot)
    );
  }
  refreshDetailInformation(inventoryAgingSnapshot: InventoryAgingSnapshot) {
  
    inventoryAgingSnapshot.clientInventoryAgingSnapshots.forEach(
      clientInventoryAgingSnapshot => this.loadClient(clientInventoryAgingSnapshot)
    )
      

      // this.loadItems(receipt);
  }

  loadClient(clientInventoryAgingSnapshot: ClientInventoryAgingSnapshot) {
     
    if (clientInventoryAgingSnapshot.clientId && clientInventoryAgingSnapshot.client == null) {
      this.localCacheService.getClient(clientInventoryAgingSnapshot.clientId).subscribe(
        {
          next: (clientRes) => clientInventoryAgingSnapshot.client = clientRes
        }
      );
      
    }
  }
 
  generateInventoryAgingSnapshot() {

    this.isSpinning = true;
    this.inventoryAgingSnapshotService.generateInventoryAgingSnapshot()
    .subscribe({
      next: (invenotryAgingSnapshotRes) => {
        this.searchForm!.value.number.setValue(invenotryAgingSnapshotRes.number);
        this.isSpinning = false;
        this.search();
      } ,
      error: () => this.isSpinning = false
    })
  }

  remove(inventoryAgingSnapshot: InventoryAgingSnapshot) {
    this.isSpinning = true;
    this.inventoryAgingSnapshotService.removeInventoryAgingSnapshot(inventoryAgingSnapshot.id!)
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
