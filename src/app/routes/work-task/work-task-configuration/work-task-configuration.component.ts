import { formatDate } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STComponent, STColumn } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { OperationType } from '../models/operation-type';
import { WorkTaskConfiguration } from '../models/work-task-configuration';
import { WorkTaskType } from '../models/work-task-type.enum';
import { OperationTypeService } from '../services/operation-type.service';
import { WorkTaskConfigurationService } from '../services/work-task-configuration.service';

@Component({
    selector: 'app-work-task-work-task-configuration',
    templateUrl: './work-task-configuration.component.html',
    styleUrls: ['./work-task-configuration.component.less'],
    standalone: false
})
export class WorkTaskWorkTaskConfigurationComponent implements OnInit {
  isSpinning = false;

  @ViewChild('st', { static: true })
  st!: STComponent;
  columns: STColumn[] = [
    { title: this.i18n.fanyi("sourceLocation"),  index: 'sourceLocation.name' , }, 
    { title: this.i18n.fanyi("sourceLocationGroup"),  index: 'sourceLocationGroup.name' , }, 
    { title: this.i18n.fanyi("sourceLocationGroupType"),  index: 'sourceLocationGroupType.name' , }, 
    { title: this.i18n.fanyi("destinationLocation"),  index: 'destinationLocation.name' , }, 
    { title: this.i18n.fanyi("destinationLocationGroup"),  index: 'destinationLocationGroup.name' , }, 
    { title: this.i18n.fanyi("destinationLocationGroupType"),  index: 'destinationLocationGroupType.name' , }, 
    { title: this.i18n.fanyi("workTaskType"),  index: 'workTaskType' , }, 
    { title: this.i18n.fanyi("operationType"),  index: 'operationType.name' , }, 
    { title: this.i18n.fanyi("priority"),  index: 'priority' , }, 
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
      iif: () => !this.displayOnly
    }
  ]; 
  
  searchForm!: UntypedFormGroup;
  workTaskConfigurations: WorkTaskConfiguration[] = [];
  searchResult = "";
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  workTaskTypes = WorkTaskType;
  operationTypes: OperationType[] = [];

   
  displayOnly = false;
  constructor( 
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private workTaskConfigurationService: WorkTaskConfigurationService,
    private operationTypeService: OperationTypeService,
    private messageService: NzMessageService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private userService: UserService,
    private fb: UntypedFormBuilder,) {
      userService.isCurrentPageDisplayOnly("/work-task/work-task-configuration").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                       
     }

  ngOnInit(): void { 
    this.titleService.setTitle(this.i18n.fanyi('menu.main.work-task.work-task-configuration'));
    // initiate the search form
    this.searchForm = this.fb.group({
      sourceLocationGroupType: [null],
      sourceLocationGroup: [null],
      sourceLocation: [null],
      destinationLocationGroupType: [null],
      destinationLocationGroup: [null],
      destinationLocation: [null],
      workTaskType: [null], 
      operationType: [null], 
    });

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['workTaskType']) {
        this.searchForm.value.workTaskType.setValue(params['workTaskType']);
        this.search();
      }
    });
  
    
    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });

    this.operationTypeService.getOperationTypes().subscribe({
      next: (operationTypeRes) => this.operationTypes = operationTypeRes
    });
  }

    
  resetForm(): void {
    this.searchForm.reset();
    this.workTaskConfigurations = []; 
  }
  search(): void {
    this.isSpinning = true; 
    this.workTaskConfigurationService
      .getWorkTaskConfigurations( 
        this.searchForm.value.sourceLocationGroupType, undefined, 
        this.searchForm.value.sourceLocationGroup, undefined,
        undefined, this.searchForm.value.sourceLocation,
        this.searchForm.value.destinationLocationGroupType, undefined,
        this.searchForm.value.destinationLocationGroup, undefined,
        undefined, this.searchForm.value.destinationLocation, 
        this.searchForm.value.workTaskType,
        this.searchForm.value.operationType)
      .subscribe({

        next: (workTaskConfigurationRes) => {
          this.workTaskConfigurations = workTaskConfigurationRes;
          this.isSpinning = false;

          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: workTaskConfigurationRes.length
          });

        },
        error: () => {
          this.isSpinning = false;
          this.searchResult = '';
        }
      });
      
  }
 
  removeWorkTaskConfiguration(workTaskConfiguration: WorkTaskConfiguration) : void{
    this.isSpinning = true; 
    this.workTaskConfigurationService.removeWorkTaskConfiguration(workTaskConfiguration).subscribe({

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

  procesSourceLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.value.sourceLocation.setValue(selectedLocationName); 
  } 
  procesDestinationLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.searchForm.value.destinationLocation.setValue(selectedLocationName); 
  } 
}
