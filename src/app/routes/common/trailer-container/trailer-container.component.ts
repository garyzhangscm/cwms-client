import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzImageService } from 'ng-zorro-antd/image';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ItemSampling } from '../../inventory/models/item-sampling';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { TrailerContainer } from '../models/trailer-container';
import { TrailerContainerService } from '../services/trailer-container.service';

@Component({
  selector: 'app-common-trailer-container',
  templateUrl: './trailer-container.component.html',
  styleUrls: ['./trailer-container.component.less']
})
export class CommonTrailerContainerComponent implements OnInit {

  isSpinning = false;
  
 
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("size"),  index: 'size' , 
    iif: () => this.isChoose('size')  }, 
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("size"), value: 'size', checked: true },      
    
  ];

 
  searchForm!: FormGroup;
  trailerContainers: TrailerContainer[] = [];
  searchResult = "";

  constructor(private http: _HttpClient,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private trailerContainerService: TrailerContainerService,
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private companyService: CompanyService,
    private nzImageService: NzImageService,
    private fb: FormBuilder,) { }

  ngOnInit(): void {  
    // initiate the search form
    this.searchForm = this.fb.group({
      number: [null], 
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
    this.trailerContainers = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.trailerContainerService
      .getTrailerContainers(this.searchForm.value.number)
      .subscribe({

        next: (containerRes) => {
          this.trailerContainers = containerRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: containerRes.length
          });
 

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   

  removeContainer(trailerContainer : TrailerContainer) {
    
    this.isSpinning = true;
    this.trailerContainerService.removeTrailerContainer(trailerContainer).subscribe({
      next: () => {

        this.isSpinning = false;
        this.messageService.success(this.i18n.fanyi('message.action.success'));
         
        this.search();
      },
      error: () => {
        this.isSpinning = false;
      },
    });
  }

}
