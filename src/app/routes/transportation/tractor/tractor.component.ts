import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { Tractor } from '../models/tractor'; 
import { TractorService } from '../services/tractor.service'; 

@Component({
    selector: 'app-common-tractor',
    templateUrl: './tractor.component.html',
    styleUrls: ['./tractor.component.less'],
    standalone: false
})
export class CommonTractorComponent implements OnInit {
  isSpinning = false;
  
 
  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("number"),  index: 'number' ,
      iif: () => this.isChoose('number')  }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , 
    iif: () => this.isChoose('description')  }, 
    { title: this.i18n.fanyi("licensePlateNumber"),  index: 'licensePlateNumber' , 
    iif: () => this.isChoose('licensePlateNumber')  }, 
    {
      title: 'location', width: 210, 
      render: 'locationColumn',
      iif: () => this.isChoose('location')  }, 
    
    {
      title: 'action',
      renderTitle: 'actionColumnTitle',fixed: 'right',width: 210, 
      render: 'actionColumn',
      iif: () => !this.displayOnly
    },
  ]; 
  
  customColumns = [

    { label: this.i18n.fanyi("number"), value: 'number', checked: true },
    { label: this.i18n.fanyi("description"), value: 'description', checked: true },
    { label: this.i18n.fanyi("licensePlateNumber"), value: 'licensePlateNumber', checked: true },      
    { label: this.i18n.fanyi("location"), value: 'location', checked: true },      
    
  ];
  isChoose(key: string): boolean {
    return !!this.customColumns.find(w => w.value === key && w.checked);
  }

  columnChoosingChanged(): void{ 
    if (this.st !== undefined && this.st.columns !== undefined) {
      this.st!.resetColumns({ emitReload: true });

    }
  }

  
  @ViewChild('trailerTable', { static: true })
  trailerTable!: STComponent;
  trailerTableColumns: STColumn[] = [ 
    {
      title: 'number',  
      render: 'numberColumn',
    },
    { title: this.i18n.fanyi("description"),  index: 'description' ,    }, 
    { title: this.i18n.fanyi("size"),  index: 'size' ,    }, 
  ]; 
  
  searchForm!: UntypedFormGroup;
  tractors: Tractor[] = [];
  searchResult = "";

  displayOnly = false;
  constructor(
    private userService: UserService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService, 
    private activatedRoute: ActivatedRoute,
    private tractorService: TractorService,
    private messageService: NzMessageService, 
    private fb: UntypedFormBuilder,) { 
      userService.isCurrentPageDisplayOnly("/transportation/tractor").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                 
    }

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

  resetForm(): void {
    this.searchForm.reset();
    this.tractors = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.tractorService
      .getTractors(this.searchForm.value.number)
      .subscribe({

        next: (tractorRes) => {
          this.tractors = tractorRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: tractorRes.length
          });
 

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }   
  removeTractor(tractor : Tractor) {
    
    this.isSpinning = true;
    this.tractorService.removeTractor(tractor).subscribe({
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
