import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { OperationType } from '../models/operation-type';
import { OperationTypeService } from '../services/operation-type.service';

@Component({
    selector: 'app-work-task-operation-type',
    templateUrl: './operation-type.component.html',
    styleUrls: ['./operation-type.component.less'],
    standalone: false
})
export class WorkTaskOperationTypeComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("name"),  index: 'name' , }, 
    { title: this.i18n.fanyi("description"),  index: 'description' , }, 
    { title: this.i18n.fanyi("defaultPriority"),  index: 'defaultPriority' , }, 
    {
      title: this.i18n.fanyi("action"),  
      buttons: [ 
        {
          text: this.i18n.fanyi("remove"),  
          type: 'link',
          click: (_record) => this.removeOperationType(_record)
        }
      ]
    }
  ]; 

  
  searchForm!: UntypedFormGroup;
  operationTypes: OperationType[] = [];
  searchResult = "";
   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private operationTypeService: OperationTypeService,
    private messageService: NzMessageService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/work-task/operation-type").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                       
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-task.operation-type'));
    // initiate the search form
    this.searchForm = this.fb.group({
      name: [null],
      description: [null]
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });}

    
  resetForm(): void {
    this.searchForm.reset();
    this.operationTypes = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.operationTypeService
      .getOperationTypes(this.searchForm.value.name, 
        this.searchForm.value.description )
      .subscribe({

        next: (operationTypeRes) => {
          this.operationTypes = operationTypeRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: operationTypeRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
 
  removeOperationType(operationType: OperationType) : void{
    this.isSpinning = true; 
    this.operationTypeService.removeOperationType(operationType).subscribe({

      next: () => { 
        this.isSpinning = false; 
        this.messageService.success(this.i18n.fanyi('message.remove.success'));
        this.search();

      },
      error: () => {
        this.isSpinning = false; 
      }
    });
    
  }

}
