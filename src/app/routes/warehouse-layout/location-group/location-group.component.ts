import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupType } from '../models/location-group-type';
import { LocationGroup } from '../models/location-group';
import { LocationGroupService } from '../services/location-group.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-warehouse-layout-location-group',
  templateUrl: './location-group.component.html',
  styleUrls: ['./location-group.component.less'],
})
export class WarehouseLayoutLocationGroupComponent implements OnInit {
  // Select control for Location Group Types
  locationGroupTypes: Array<{ label: string; value: string }> = [];
  selectedLocationGroupTypes = [];
  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  locationGroups: LocationGroup[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByName = [];
  filtersByDescription = [];
  filtersByLocationGroupType = [];
  // Save filters that already selected
  selectedFiltersByName: string[] = [];
  selectedFiltersByDescription: string[] = [];
  selectedFiltersByLocationGroupType: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  constructor(
    private http: _HttpClient,
    private fb: FormBuilder,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
  ) {}

  resetForm(): void {
    this.searchForm.reset();
  }
  search(): void {
    this.locationGroupService.getLocationGroups(this.selectedLocationGroupTypes).subscribe(locationGroupsRes => {
      this.locationGroups = locationGroupsRes;

      this.filtersByName = [];
      this.filtersByDescription = [];
      this.filtersByLocationGroupType = [];

      this.locationGroups.forEach(locationGroup => {
        this.filtersByName.push({ text: locationGroup.name, value: locationGroup.name });
        this.filtersByDescription.push({ text: locationGroup.description, value: locationGroup.description });
        this.filtersByLocationGroupType.push({
          text: locationGroup.locationGroupType.name,
          value: locationGroup.locationGroupType.name,
        });
      });
    });
  }

  currentPageDataChange($event: LocationGroup[]): void {
    this.locationGroups = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.locationGroups.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.locationGroups.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.locationGroups.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.search();
  }

  filter(
    selectedFiltersByName: string[],
    selectedFiltersByDescription: string[],
    selectedFiltersByLocationGroupType: string[],
  ) {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.selectedFiltersByLocationGroupType = selectedFiltersByLocationGroupType;
  }

  ngOnInit() {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupType().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      locationGroupTypeList.forEach(locationGroupType =>
        this.locationGroupTypes.push({ label: locationGroupType.description, value: locationGroupType.id.toString() }),
      );
    });
  }
}
