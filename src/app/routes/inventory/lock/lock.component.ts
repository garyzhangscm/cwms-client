import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme'; 
import { NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Inventory } from '../models/inventory';
import { InventoryLock } from '../models/inventory-lock'; 
import { InventoryLockService } from '../services/inventory-lock.service';

@Component({
    selector: 'app-inventory-lock',
    templateUrl: './lock.component.html',
    styleUrls: ['./lock.component.less'],
    standalone: false
})
export class InventoryLockComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  isSpinning = false;
 
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("name"),  index: 'name' ,
      iif: () => this.isChoose('name')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("allow-pick"),  index: 'allowPick' , 
    iif: () => this.isChoose('allowPick')  }, 
    
    { title: this.i18n.fanyi("allow-ship"),  index: 'allowShip' , 
    iif: () => this.isChoose('allowShip')  }, 
    { title: this.i18n.fanyi("enabled"),  index: 'enabled' , 
    iif: () => this.isChoose('enabled')  },  
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("name"), value: 'name', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("allow-pick"), value: 'allowPick', checked: true },
    { label: this.i18n.fanyi("allow-ship"), value: 'allowShip', checked: true },
    { label: this.i18n.fanyi("enabled"), value: 'enabled', checked: true }, 
     
    
  ];

 
  searchForm!: UntypedFormGroup;
  inventoryLockList: InventoryLock[] = [];
  searchResult = ""; 

  mapOfLockedInventory: { [key: number]: Inventory[] } = {};
   
   
  displayOnly = false;
  constructor(private http: _HttpClient, 
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute, 
    private messageService: NzMessageService,
    private inventoryLockService: InventoryLockService,
    private nzImageService: NzImageService,
    private fb: UntypedFormBuilder,
    private userService: UserService) { 
      userService.isCurrentPageDisplayOnly("/inventory/lock").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );               
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.lock'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null], 
    });
 
    this.activatedRoute.queryParams.subscribe(params => {
      // if we are changing an existing record
      if (params['name']) { 
        this.searchForm!.value.name.setValue(params['name']);
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
    this.inventoryLockList = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.inventoryLockService
      .getInventoryLocks(this.searchForm.value.name)
      .subscribe({

        next: (inventoryLockRes) => {
          this.inventoryLockList = inventoryLockRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryLockRes.length
          });
 

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   
  
 
  disableInventoryLock(inventoryLock : InventoryLock) {

    this.isSpinning = true;
    this.inventoryLockService.disableInventoryLock(inventoryLock).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.searchForm.value.name.setValue(inventoryLock.name); 

        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }
  enableInventoryLock(inventoryLock : InventoryLock) {

    this.isSpinning = true;
    this.inventoryLockService.enableInventoryLock(inventoryLock).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.searchForm.value.name.setValue(inventoryLock.name); 

        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }
  removeInventoryLock(inventoryLock : InventoryLock) {

    this.isSpinning = true;
    this.inventoryLockService.removeInventoryLock(inventoryLock.id!).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.searchForm.value.name.setValue(inventoryLock.name); 

        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }
   

  unlockInventory(inventoryLock: InventoryLock, inventory: Inventory) {
    
    this.isSpinning = true;
    this.inventoryLockService.unlockInventory(inventoryLock, inventory).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        
        this.searchForm.value.name.setValue(inventoryLock.name); 

        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

  loadLockedInventory(inventoryLock: InventoryLock) {

    
    this.isSpinning = true;
    this.inventoryLockService.getLockedInventory(inventoryLock).subscribe({
      next: (lockedInventory) => {

        this.isSpinning = false; 
        this.mapOfLockedInventory[inventoryLock.id!] = lockedInventory;
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }
  
  inventoryLockTableChanged(event: STChange) : void { 
    
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.loadLockedInventory(event.expand);
    }
  }
}
