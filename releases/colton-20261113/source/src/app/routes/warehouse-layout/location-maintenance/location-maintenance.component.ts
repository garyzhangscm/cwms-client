import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
 
import { Unit } from '../../common/models/unit';
import { UnitType } from '../../common/models/unit-type';
import { UnitService } from '../../common/services/unit.service';
import { LocationGroup } from '../models/location-group'; 
import { PickZone } from '../models/pick-zone';
import { WarehouseLocation } from '../models/warehouse-location'; 
import { LocationGroupService } from '../services/location-group.service';
import { LocationService } from '../services/location.service';
import { PickZoneService } from '../services/pick-zone.service'; 

@Component({
    selector: 'app-warehouse-layout-location-maintenance',
    templateUrl: './location-maintenance.component.html',
    standalone: false
})
export class WarehouseLayoutLocationMaintenanceComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle = '';
  stepIndex = 0;
  currentLocation!: WarehouseLocation;   
  isSpinning = false;
  newLocation = true;
   

  lengthUnits: Unit[] = [];
  volumeUnits: Unit[] = [];
  defaultLengthUnit?: Unit;
  defaultVolumeUnit?: Unit;

  locationGroups: LocationGroup[] = [];
  pickZones: PickZone[] = [];
  
  constructor( 
    private activatedRoute: ActivatedRoute,
    private titleService: TitleService, 
    private locationGroupService: LocationGroupService,
    private pickZoneService: PickZoneService, 
    private locationService: LocationService,
    private messageService: NzMessageService,
    private router: Router,
    private unitService: UnitService,
  ) {
    this.currentLocation = this.getEmptyLocation();
  }

  ngOnInit(): void { 
    this.stepIndex = 0;

    this.titleService.setTitle(this.i18n.fanyi('modify'));
    this.pageTitle = this.i18n.fanyi('modify');
    // let's load the unit first
    
    this.unitService.loadUnits().subscribe({
      next: (unitsRes) => {

        // setup the the unit
        unitsRes.forEach(
          unit => {
            if (unit.type === UnitType.LENGTH) {
              this.lengthUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultLengthUnit = unit;
                console.log(`defaultLengthUnit: ${this.defaultLengthUnit?.name}`);
              }
            }
            else if (unit.type === UnitType.VOLUME) {
              this.volumeUnits.push(unit);
              if(unit.baseUnitFlag) {
                this.defaultVolumeUnit = unit;
                console.log(`defaultVolumeUnit: ${this.defaultVolumeUnit?.name}`);
              }
            }
          }
        )

        // setup the location structure
        this.activatedRoute.queryParams.subscribe(params => {
          if (params['id']) {
            this.locationService.getLocation(params['id']).subscribe(
              {
    
                next: (locationRes) => {
                  this.setupDefaultUnit(locationRes);
                  this.currentLocation = locationRes;
                  this.newLocation = false;
                }
    
              }); 
          } else {
            this.newLocation = true
            this.currentLocation = this.getEmptyLocation();
             
            this.titleService.setTitle(this.i18n.fanyi('new'));
            this.pageTitle = this.i18n.fanyi('new'); 
          }
        }); 


      }
    }) 

    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
    this.pickZoneService.loadPickZones().subscribe((pickZoneRes: PickZone[]) => {
      this.pickZones = pickZoneRes;
    });
 
 
  }
   
  
  setupDefaultUnit(location : WarehouseLocation) {

    if (!location.lengthUnit) {
      location.lengthUnit = this.defaultLengthUnit?.name;
    }
    if (!location.widthUnit) {
      location.widthUnit = this.defaultLengthUnit?.name;
    }
    if (!location.heightUnit) {
      location.heightUnit = this.defaultLengthUnit?.name;
    }
    if (!location.capacityUnit) {
      location.capacityUnit = this.defaultVolumeUnit?.name;
    }
  } 
  getEmptyLocation(): WarehouseLocation {
    return { 
      name: "",
      aisle: "", 
      length: 0,
      lengthUnit: this.defaultLengthUnit?.name,
      width: 0,
      widthUnit: this.defaultLengthUnit?.name,
      height: 0,
      heightUnit: this.defaultLengthUnit?.name,
      pickSequence: 0,
      putawaySequence: 0,
      countSequence: 0,
      capacity: 0,
      capacityUnit: this.defaultVolumeUnit?.name,
      fillPercentage: 100,  
      enabled: true,
      locked: false,
      locationGroup: {
        
      }
    };
  }

  previousStep(): void {
    this.stepIndex -= 1;
  }
  nextStep(): void {
    this.stepIndex += 1;
  }

  confirm(): void { 
    this.isSpinning = true;
    if (this.newLocation) {

      this.locationService.addLocation(this.currentLocation).subscribe({
        next: (locationRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/warehouse-layout/warehouse-location?name=${locationRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
    else {

      this.locationService.changeLocation(this.currentLocation).subscribe({
        next: (locationRes) => {

          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(`/warehouse-layout/warehouse-location?name=${locationRes.name}`);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      }); 
    }
  }

  
  lengthUnitSelected(unit: Unit) { 
    this.currentLocation.lengthUnit = unit.name;
  } 
  widthUnitSelected(unit: Unit) { 
    this.currentLocation.widthUnit = unit.name;
  } 
  heightUnitSelected(unit: Unit) { 
    this.currentLocation.heightUnit = unit.name;
  } 

  capacityUnitSelected(unit: Unit) { 
    this.currentLocation.capacityUnit = unit.name;
  } 

  locationGroupChanged(locationGroupId: number) {
    let locationGroup = this.locationGroups.find(locationGroup => locationGroup.id == locationGroupId);
    console.log(`location group is changed to ${locationGroup?.name}`)
    this.currentLocation.locationGroup = locationGroup;
  }
  
  pickZoneChanged(pickZoneId: number) {
    let pickZone = this.pickZones.find(pickZone => pickZone.id == pickZoneId);
    console.log(`pick zone is changed to ${pickZone?.name}`)
    this.currentLocation.pickZone = pickZone;
  }
}
