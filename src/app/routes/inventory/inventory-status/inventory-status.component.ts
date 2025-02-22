import { formatDate } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { InventoryStatus } from '../models/inventory-status';
import { InventoryStatusService } from '../services/inventory-status.service';

@Component({
    selector: 'app-inventory-inventory-status',
    templateUrl: './inventory-status.component.html',
    styleUrls: ['./inventory-status.component.less'],
    standalone: false
})
export class InventoryInventoryStatusComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [ 
    { title: this.i18n.fanyi("name"), index: 'name', },   
    { title: this.i18n.fanyi("description"), index: 'description', },   
    { title: this.i18n.fanyi("availableStatusFlag"), index: 'availableStatusFlag', },   
    { title: this.i18n.fanyi("reason-code"), render: 'reasonCodeColumn', },   
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
   
  ];
  
  isSpinning = false;
  
  listOfAllInventoryStatus: InventoryStatus[] = [];
  searchForm!: UntypedFormGroup;
  searchResult = '';

  displayOnly = false;
  constructor(private http: _HttpClient,
    private fb: UntypedFormBuilder, 
    private inventoryStatusService: InventoryStatusService,
    private modalService: NzModalService,
    private messageService: NzMessageService,
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService,  
    private userService: UserService, ) {
      userService.isCurrentPageDisplayOnly("/inventory/status").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                                
    
    }

    ngOnInit(): void {
      this.titleService.setTitle(this.i18n.fanyi('menu.main.inventory.status'));
      // initiate the search form
      this.searchForm = this.fb.group({
        name: [null], 
      });
  
      // IN case we get the number passed in, refresh the display
      // and show the order information
      this.activatedRoute.queryParams.subscribe(params => {
        if (params['name']) {
          this.searchForm.value.name.setValue(params['name']);
          this.search();
        }
      });
    }
  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllInventoryStatus = []; 

  }

  search(): void {
    this.isSpinning = true;
    this.searchResult = '';
     

    this.inventoryStatusService.getInventoryStatuses(
      this.searchForm.value.name.value, ).subscribe({

        next: (inventoryStatusRes) => {
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: inventoryStatusRes.length,
          });
          
          this.isSpinning = false;
          this.listOfAllInventoryStatus = inventoryStatusRes;  
        }, 
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        },

      });  
  }
  
  removeInventoryStatus(id: number): void {
    // make sure we have at least one checkbox checked
    this.isSpinning = true;
    const modal: NzModalRef = this.modalService.confirm({
      nzTitle: this.i18n.fanyi('modal.delete.header.title'),
      nzContent: this.i18n.fanyi('modal.delete.content'),
      nzOkText: this.i18n.fanyi('confirm'),
      nzOkDanger: true,
      nzOnOk: () => {
        this.inventoryStatusService.removeInventoryStatus(id).subscribe({
          next: () => {
            this.messageService.success(this.i18n.fanyi('message.action.success'));
            this.isSpinning = false;
            this.search();
          },
          error: () => (this.isSpinning = false),
        });
      },
      nzCancelText: this.i18n.fanyi('cancel'),
      nzOnCancel: () => {
        modal.close();
        this.isSpinning = false;
      },
    });
  }

}
