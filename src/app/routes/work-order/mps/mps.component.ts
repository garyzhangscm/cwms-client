import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { UtilService } from '../../util/services/util.service';
import { MasterProductionSchedule } from '../models/master-production-schedule';
import { MasterProductionScheduleService } from '../services/master-production-schedule.service';

@Component({
    selector: 'app-work-order-mps',
    templateUrl: './mps.component.html',
    styleUrls: ['./mps.component.less'],
    standalone: false
})
export class WorkOrderMpsComponent implements OnInit {

  searchForm!: UntypedFormGroup;
  
  listOfAllMPSs: MasterProductionSchedule[] = [];
  isSpinning = false;
  searchResult= "";
 
  removeMPSModal!: NzModalRef;
  removeMPSForm!: UntypedFormGroup;

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private masterProductionScheduleService: MasterProductionScheduleService,
    private activatedRoute: ActivatedRoute, 
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/work-order/mps").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                                     
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('mps'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      description: [null],
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.number) {
        this.searchForm.controls.number.setValue(params.number);
        this.search();
      }
    });

  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllMPSs = []; 

  }
  
  search(): void {
    this.isSpinning = true; 
     

    this.masterProductionScheduleService.getMasterProductionSchedules(
      this.searchForm.controls.number.value,  
      this.searchForm.controls.description.value).subscribe(
        mpsRes => {
  

          // this.collapseAllRecord(expandedOrderId);

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: mpsRes.length,
          });
          this.listOfAllMPSs =mpsRes; 
         
        },
        () => {
          this.isSpinning = false;
          this.searchResult = '';
        },
    );
  }

  
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    
    { title: this.i18n.fanyi("number"), index: 'number', iif: () => this.isChoose('number'), width: 100},
    { title: this.i18n.fanyi("description"), index: 'description', iif: () => this.isChoose('description'), width: 150},
    { title: this.i18n.fanyi("item"), index: 'item.name', iif: () => this.isChoose('itemName'), width: 100 },
    { title: this.i18n.fanyi("item.description"), index: 'item.description', iif: () => this.isChoose('itemDescription'), width: 100 },
    { title: this.i18n.fanyi("quantity"), index: 'totalQuantity', iif: () => this.isChoose('totalQuantity'), width: 50 },
    { title: this.i18n.fanyi("planned-quantity"), index: 'plannedQuantity', iif: () => this.isChoose('plannedQuantity'), width: 50 },
    {
      title: this.i18n.fanyi("cutoffDate"),
      // renderTitle: 'customTitle',
      render: 'cutoffDateColumn',
      iif: () => this.isChoose('cutoffDate'), width: 100
    },
    {
      title: 'action',
      fixed: 'right',width: 100, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    }, 
   
  ];
  customColumns = [
 
    { label: this.i18n.fanyi("number"), value: 'number', checked: true }, 
    { label: this.i18n.fanyi("description"), value: 'description', checked: true }, 
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true }, 
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true }, 
    { label: this.i18n.fanyi("quantity"), value: 'totalQuantity', checked: true }, 
    { label: this.i18n.fanyi("planned-quantity"), value: 'plannedQuantity', checked: true }, 
    { label: this.i18n.fanyi("cutoffDate"), value: 'cutoffDate', checked: true }, 
  ];

  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }
  
  mpsTableChanged(event: STChange) : void { 
    if (event.type === 'expand' && event.expand.expand === true) {
      
      this.showMPSDetails(event.expand);
    } 

  }
  showMPSDetails(masterProductionSchedule: MasterProductionSchedule) {

  }
  openRemoveMPSModal(
    masterProductionSchedule: MasterProductionSchedule,
    tplRemoveMPSModalTitle: TemplateRef<{}>,
    tplRemoveMPSModalContent: TemplateRef<{}>,
  ): void {
    
    this.removeMPSForm = this.fb.group({
      moveSuccessor: new UntypedFormControl({ value: true, disabled: false }),
    });


    this.removeMPSModal = this.modalService.create({
      nzTitle: tplRemoveMPSModalTitle,
      nzContent: tplRemoveMPSModalContent,
      nzOkText: this.i18n.fanyi('confirm'),
      nzCancelText: this.i18n.fanyi('cancel'),
      nzMaskClosable: false,
      nzOnCancel: () => {
        this.removeMPSModal.destroy();
      },
      nzOnOk: () => {
        this.removeMPS(
          masterProductionSchedule, 
          this.removeMPSForm.controls.moveSuccessor.value,
        );
      },

      nzWidth: 1000,
    });

  }
  removeMPS(masterProductionSchedule: MasterProductionSchedule, moveSuccessor: boolean) : void{
    this.isSpinning = true;
    this.masterProductionScheduleService.removeMasterProductionSchedule(masterProductionSchedule, moveSuccessor).subscribe({
      next: () => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        this.isSpinning = false;
        this.search();
      }, 
      error: () => this.isSpinning = false
    });

  } 
}
