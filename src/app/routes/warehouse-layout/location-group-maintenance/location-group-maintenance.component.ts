import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { LocationGroup } from '../models/location-group';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupType } from '../models/location-group-type';
import { LocationVolumeTrackingPolicy } from '../models/location-volume-tracking-policy.enum';
import { InventoryConsolidationStrategy } from '../models/inventory-consolidation-strategy.enum';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SCHEMA_THIRDS_COMPONENTS } from '@shared/json-schema/json-schema.module';

@Component({
  selector: 'app-warehouse-layout-location-group-maintenance',
  templateUrl: './location-group-maintenance.component.html',
})
export class WarehouseLayoutLocationGroupMaintenanceComponent implements OnInit {
  pageTitle: string;
  locationGroupForm: FormGroup;
  selectedLocationGroupType: LocationGroupType;

  locationGroupTypes: Array<{ label: string; value: string }> = [];

  volumeTrackingPolicies = LocationVolumeTrackingPolicy;
  inventoryConsolidationStrategies = InventoryConsolidationStrategy;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private fb: FormBuilder,
    private locationGroupTypeService: LocationGroupTypeService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.location-group-maintenance.header.title');
  }

  ngOnInit() {
    this.locationGroupForm = this.fb.group({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      storable: new FormControl(false, Validators.required),
      pickable: new FormControl(false, Validators.required),
      countable: new FormControl(false, Validators.required),
      trackingVolume: new FormControl(false, Validators.required),
      volumeTrackingPolicy: new FormControl('', Validators.required),
      inventoryConsolidationStrategy: new FormControl('', Validators.required),
    });
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      locationGroupTypeList.forEach(locationGroupType =>
        this.locationGroupTypes.push({ label: locationGroupType.description, value: locationGroupType.id.toString() }),
      );
    });

    this.activatedRoute.queryParams.subscribe(params => {
      // We are in process of adding a location Group
      // and we already fill in all the information. Let's
      // load the location group from session storage
      if (params.inprocess === 'true') {
        const locationGroup = JSON.parse(sessionStorage.getItem('location-group-maintenance.location-group'));

        this.locationGroupForm.patchValue(locationGroup);
      }
    });

    this.titleService.setTitle(this.i18n.fanyi('page.location-group-maintenance.header.title'));
  }

  goToConfirmPage(): void {
    if (this.locationGroupForm.valid) {
      const locationGroup: LocationGroup = this.locationGroupForm.value;
      locationGroup.locationGroupType = this.selectedLocationGroupType;
      sessionStorage.setItem('location-group-maintenance.location-group', JSON.stringify(locationGroup));
      const url = '/warehouse-layout/location-group-maintenance/confirm';
      this.router.navigateByUrl(url);
    } else {
      this.displayFormError(this.locationGroupForm);
    }
  }

  displayFormError(fromGroup: FormGroup) {
    // tslint:disable-next-line: forin
    for (const i in fromGroup.controls) {
      fromGroup.controls[i].markAsDirty();
      fromGroup.controls[i].updateValueAndValidity();
    }
  }
  locationGroupTypeChange(locationGroupTypeId: string) {
    // load the location group type and update the location group
    console.log(`locationGroupTypeId:${JSON.stringify(locationGroupTypeId)}`);
    this.locationGroupTypeService.getLocationGroupType(+locationGroupTypeId).subscribe(res => {
      this.selectedLocationGroupType = res;
    });
  }
}
