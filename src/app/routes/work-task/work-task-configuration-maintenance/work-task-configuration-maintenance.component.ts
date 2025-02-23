import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupType } from '../../warehouse-layout/models/location-group-type';
import { LocationGroupTypeService } from '../../warehouse-layout/services/location-group-type.service';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { LocationService } from '../../warehouse-layout/services/location.service';
import { WarehouseService } from '../../warehouse-layout/services/warehouse.service';
import { OperationType } from '../models/operation-type';
import { WorkTaskConfiguration } from '../models/work-task-configuration';
import { WorkTaskType } from '../models/work-task-type.enum';
import { OperationTypeService } from '../services/operation-type.service';
import { WorkTaskConfigurationService } from '../services/work-task-configuration.service';

@Component({
    selector: 'app-work-task-work-task-configuration-maintenance',
    templateUrl: './work-task-configuration-maintenance.component.html',
    standalone: false
})
export class WorkTaskWorkTaskConfigurationMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentWorkTaskConfiguration!: WorkTaskConfiguration;
  newWorkTaskConfiguration = true;
  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  workTaskTypes = WorkTaskType;
  operationTypes: OperationType[] = [];

  isSpinning = false;

  constructor(
    private http: _HttpClient, 
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private warehouseService: WarehouseService,
    private workTaskConfigurationService: WorkTaskConfigurationService,
    private operationTypeService: OperationTypeService, 
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private locationService: LocationService,
    private messageService: NzMessageService,
    private router: Router
  ) {
    this.currentWorkTaskConfiguration = { 
      warehouseId: warehouseService.getCurrentWarehouse().id, 
    }
  }

  ngOnInit(): void {  
    this.titleService.setTitle(this.i18n.fanyi('new'));
    this.pageTitle = this.i18n.fanyi('new');
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.isSpinning = true;
        this.workTaskConfigurationService.getWorkTaskConfiguration(params['id'])
        .subscribe({
          next: (workTaskConfigurationRes) => {
            this.newWorkTaskConfiguration = false;
            console.log(`newWorkTaskConfiguration = false`);
            this.currentWorkTaskConfiguration = workTaskConfigurationRes;
            this.currentWorkTaskConfiguration.operationTypeId =
                this.currentWorkTaskConfiguration.operationType?.id;
            this.isSpinning = false;
          },
          error: () => {
            this.newWorkTaskConfiguration = true;
            console.log(`newWorkTaskConfiguration = true`);
            this.isSpinning = false;
          }
        });
      }
      else {
        this.newWorkTaskConfiguration = true;
        this.isSpinning = false;
        console.log(`newWorkTaskConfiguration = true`);

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
 
  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    if (this.stepIndex == 0) {
      // when flow from basic info into confirm page,
      // let's double check if the user has been input all
      // the necessary data and the value is correct
      if (!this.validateInput()) {

        return;
      }
      this.loadDetails();
    }
    this.stepIndex += 1;
  }
  validateInput(): boolean {
    if (this.currentWorkTaskConfiguration.workTaskType == null) {
        this.messageService.error("Work Task Type is required");
        return false;
    }

    if (this.currentWorkTaskConfiguration.operationType == null || 
      this.currentWorkTaskConfiguration.operationType.id == null ) {
        this.messageService.error("Operation Type is required");
        return false;
    }


    return true;
  }

  confirm(): void { 

    this.isSpinning= true; 
    if (this.newWorkTaskConfiguration) {
      this.workTaskConfigurationService.addWorkTaskConfiguration(this.currentWorkTaskConfiguration)
      .subscribe({
        next: (workTaskConfigurationRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning= false; 
            this.router.navigateByUrl(`/work-task/work-task-configuration?workTaskType=${workTaskConfigurationRes.workTaskType}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
    }
    else {      
      this.workTaskConfigurationService.changeWorkTaskConfiguration(this.currentWorkTaskConfiguration)
      .subscribe({
        next: (workTaskConfigurationRes) => {
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning= false; 
            this.router.navigateByUrl(`/work-task/work-task-configuration?workTaskType=${workTaskConfigurationRes.workTaskType}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
    }
  }

  
  procesSourceLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.sourceLocationChanged(selectedLocationName);
    
  } 
  sourceLocationChanged(locationName: string) {

    this.isSpinning = true;
    this.locationService.getLocations(undefined, 
      undefined, locationName).subscribe({
        next: (locationRes) => {
          if (locationRes) {
            this.currentWorkTaskConfiguration.sourceLocation = locationRes;
            this.currentWorkTaskConfiguration.sourceLocationId = undefined;
          }
          else {
            this.messageService.error(`location  ${locationName} is invalid`);
          }
          this.isSpinning = false;
        },
        error: () => {
          this.currentWorkTaskConfiguration.sourceLocationId = undefined;
          this.isSpinning = false;
        }
      })
  }
  
  procesDestinationLocationQueryResult(selectedLocationName: any): void {
    console.log(`start to query with location name ${selectedLocationName}`);
    this.destinationLocationChanged(selectedLocationName);
    
  } 
  destinationLocationChanged(locationName: string) {

    this.isSpinning = true;
    this.locationService.getLocations(undefined, 
      undefined, locationName).subscribe({
        next: (locationRes) => {
          if (locationRes) {
            this.currentWorkTaskConfiguration.sourceLocation = locationRes;
            this.currentWorkTaskConfiguration.sourceLocationId = undefined;
          }
          else {
            this.messageService.error(`location  ${locationName} is invalid`);
          }
          this.isSpinning = false;
        },
        error: () => {
          this.currentWorkTaskConfiguration.sourceLocationId = undefined;
          this.isSpinning = false;
        }
      })
  }

  loadDetails() {
    if(this.currentWorkTaskConfiguration.sourceLocationGroupTypeId) {
      this.currentWorkTaskConfiguration.sourceLocationGroupType =
          this.locationGroupTypes.find(
            locationGroupType => locationGroupType.id == this.currentWorkTaskConfiguration.sourceLocationGroupTypeId
          );
    }
    if(this.currentWorkTaskConfiguration.sourceLocationGroupId) {
      this.currentWorkTaskConfiguration.sourceLocationGroup =
          this.locationGroups.find(
            locationGroup => locationGroup.id == this.currentWorkTaskConfiguration.sourceLocationGroupId
          );
    }
    if(this.currentWorkTaskConfiguration.destinationLocationGroupTypeId) {
      this.currentWorkTaskConfiguration.destinationLocationGroupType =
          this.locationGroupTypes.find(
            locationGroupType => locationGroupType.id == this.currentWorkTaskConfiguration.destinationLocationGroupTypeId
          );
    }
    if(this.currentWorkTaskConfiguration.destinationLocationGroupId) {
      this.currentWorkTaskConfiguration.destinationLocationGroup =
          this.locationGroupTypes.find(
            locationGroupType => locationGroupType.id == this.currentWorkTaskConfiguration.destinationLocationGroupId
          );
    }
  }
  operationTypeChanged(operationTypeId: number) {
    this.currentWorkTaskConfiguration.operationTypeId = operationTypeId;
    this.currentWorkTaskConfiguration.operationType = 
        this.operationTypes.find(
          operationType => operationType.id == operationTypeId
        )
  }
}
