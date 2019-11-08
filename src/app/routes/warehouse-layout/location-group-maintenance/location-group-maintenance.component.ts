import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { LocationGroup } from '../models/location-group';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupType } from '../models/location-group-type';

@Component({
  selector: 'app-warehouse-layout-location-group-maintenance',
  templateUrl: './location-group-maintenance.component.html',
})
export class WarehouseLayoutLocationGroupMaintenanceComponent implements OnInit {
  currentLocationGroup: LocationGroup;
  pageTitle: string;

  locationGroupTypes: Array<{ label: string; value: string }> = [];

  emptyLocationGroup: LocationGroup = {
    id: null,
    name: '',
    description: '',
    locationGroupType: {
      id: null,
      name: '',
      description: '',
      fourWallInventory: false,
      virtual: false,
    },
    locationCount: 0,
    pickable: false,
    storable: false,
    countable: false,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private locationGroupTypeService: LocationGroupTypeService,
  ) {
    this.currentLocationGroup = this.emptyLocationGroup;
    this.pageTitle = this.i18n.fanyi('page.location-group-maintenance.header.title');
  }

  ngOnInit() {
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
        this.currentLocationGroup = JSON.parse(sessionStorage.getItem('location-group-maintenance.location-group'));
      }
    });

    this.titleService.setTitle(this.i18n.fanyi('page.location-group-maintenance.header.title'));
  }

  goToConfirmPage(): void {
    sessionStorage.setItem('location-group-maintenance.location-group', JSON.stringify(this.currentLocationGroup));
    const url = '/warehouse-layout/location-group-maintenance/' + this.currentLocationGroup.id + '/confirm';
    this.router.navigateByUrl(url);
  }
  locationGroupTypeChange() {
    // load the location group type and update the location group
    this.locationGroupTypeService
      .getLocationGroupType(this.currentLocationGroup.locationGroupType.id)
      .subscribe(res => {
        this.currentLocationGroup.locationGroupType = res;
      });
  }
}
