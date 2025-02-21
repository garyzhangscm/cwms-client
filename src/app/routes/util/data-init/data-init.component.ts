import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { DataInitialRequest } from '../models/data-initial-request';
import { DataInitialRequestService } from '../services/data-initial-request.service';

@Component({
    selector: 'app-util-data-init',
    templateUrl: './data-init.component.html',
    styleUrls: ['./data-init.component.less'],
    standalone: false
})
export class UtilDataInitComponent implements OnInit {

  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("company.name"),  index: 'companyName' , }, 
    { title: this.i18n.fanyi("company.code"),  index: 'companyCode' , }, 
    { title: this.i18n.fanyi("warehouse.name"),  index: 'warehouseName' , }, 
    { title: this.i18n.fanyi("data-initial-request.admin-username"),  index: 'adminUserName' , }, 
    { title: this.i18n.fanyi("data-initial-request.request-username"),  index: 'requestUsername' , }, 
    { title: this.i18n.fanyi("status"),  index: 'status' , }
  ]; 

  
  searchForm!: UntypedFormGroup;
  dataInitialRequests: DataInitialRequest[] = [];
  searchResult = "";
  
  dataInitialRequestForm!: UntypedFormGroup;
  dataInitialRequestModal!: NzModalRef;
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService, 
    private dataInitialRequestService: DataInitialRequestService, 
    private modalService: NzModalService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/util/data-init").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                   
      
    
    }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.util.data-initial'));
    // initiate the search form
    this.searchForm = this.fb.group({
      companyName: [null]
    });

  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.dataInitialRequests = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.dataInitialRequestService
      .getDataInitialRequests(this.searchForm.value.companyName)
      .subscribe({

        next: (dataInitialRequestRes) => {
          this.dataInitialRequests = dataInitialRequestRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: dataInitialRequestRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }

  
  openRequestDataInitialModal(
    tplDataInitialRequestModalTitle: TemplateRef<{}>,
    tplDataInitialRequestModalContent: TemplateRef<{}>,
  ): void {
    
    this.dataInitialRequestForm = this.fb.group({
      companyName: [null],
      warehouseName: [null],
      adminUsername: [null],
    });

    // Load the location
    this.dataInitialRequestModal = this.modalService.create({
      nzTitle: tplDataInitialRequestModalTitle,
      nzContent: tplDataInitialRequestModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.dataInitialRequestModal.destroy();
      },
      nzOnOk: () => {
        this.addDataInitialRequest( 
          this.dataInitialRequestForm.controls.companyName.value,
          this.dataInitialRequestForm.controls.warehouseName.value,
          this.dataInitialRequestForm.controls.adminUsername.value,
        );
      },

      nzWidth: 1000,
    });
  }

  addDataInitialRequest(companyName: string, warehouseName: string, adminUsername: string) {
    this.isSpinning = true;
    this.dataInitialRequestService.addDataInitialRequest(companyName, warehouseName, adminUsername)
        .subscribe({
          next: () => {
            this.isSpinning = false;
            this.dataInitialRequestForm.controls.companyName.setValue(companyName);
            this.search();
          },
          error: () => this.isSpinning = false
        })
  }

} 

