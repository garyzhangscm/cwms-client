import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn, STChange } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { MaterialRequirementsPlanning } from '../models/material-requirements-planning';
import { MaterialRequirementsPlanningService } from '../services/material-requirements-planning.service';

@Component({
  selector: 'app-work-order-mrp',
  templateUrl: './mrp.component.html',
  styleUrls: ['./mrp.component.less'],
})
export class WorkOrderMrpComponent implements OnInit {
  searchForm!: FormGroup;
  
  listOfAllMRPs: MaterialRequirementsPlanning[] = [];
  isSpinning = false;
  searchResult= "";
  
  constructor(
    private fb: FormBuilder,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private materialRequirementsPlanningService: MaterialRequirementsPlanningService,
    private activatedRoute: ActivatedRoute,  
    private messageService: NzMessageService, 
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('MRP'));
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null],
      description: [null],
      mpsNumber: [null],
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
    this.listOfAllMRPs = []; 

  }
  
  search(): void {
    this.isSpinning = true; 
     

    this.materialRequirementsPlanningService.getMRPs(
      this.searchForm.controls.number.value,  
      this.searchForm.controls.description.value,  
      this.searchForm.controls.mpsNumber.value).subscribe(
        mrpRes => {
  

          // this.collapseAllRecord(expandedOrderId);

          this.isSpinning = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: mrpRes.length,
          });
          this.listOfAllMRPs =mrpRes; 
         
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
    { title: this.i18n.fanyi("mps"), index: 'mps.number', iif: () => this.isChoose('mps'), width: 50 }, 
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
    }, 
   
  ];
  customColumns = [
 
    { label: this.i18n.fanyi("number"), value: 'number', checked: true }, 
    { label: this.i18n.fanyi("description"), value: 'description', checked: true }, 
    { label: this.i18n.fanyi("item"), value: 'itemName', checked: true }, 
    { label: this.i18n.fanyi("item.description"), value: 'itemDescription', checked: true }, 
    { label: this.i18n.fanyi("mps"), value: 'mps', checked: true }, 
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
      
      this.showMRPDetails(event.expand);
    } 

  }
  
  showMRPDetails(materialRequirementsPlanning: MaterialRequirementsPlanning) {

  }

}
