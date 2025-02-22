import { formatDate } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../models/location-group';
import { LocationGroupType } from '../models/location-group-type';
import { WarehouseLocation } from '../models/warehouse-location';
import { LocationGroupTypeService } from '../services/location-group-type.service';
import { LocationGroupService } from '../services/location-group.service';
import { LocationService } from '../services/location.service';

@Component({
    selector: 'app-warehouse-layout-location-query-popup',
    templateUrl: './location-query-popup.component.html',
    styleUrls: ['./location-query-popup.component.less'],
    standalone: false
})
export class WarehouseLayoutLocationQueryPopupComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  scrollX = '100vw';

  locationNameColumn: ColumnItem<WarehouseLocation> =
    {
      name: 'location.name',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.name!.localeCompare(b.name!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false,

    };

  listOfColumns: Array<ColumnItem<WarehouseLocation>> = [
    {
      name: 'location-group',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.locationGroup!.name!.localeCompare(b.locationGroup!.name!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.aisle',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.aisle!.localeCompare(b.aisle!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.length',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.length! - b.length!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.width',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.width! - b.width!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.height',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.height! - b.height!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.capacity',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.capacity! - b.capacity!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.fillPercentage',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.fillPercentage! - b.fillPercentage!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.currentVolume',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.currentVolume! - b.currentVolume!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.pendingVolume',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.pendingVolume! - b.pendingVolume!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.putawaySequence',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.putawaySequence! - b.putawaySequence!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.pickSequence',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.pickSequence! - b.pickSequence!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.countSequence',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.countSequence! - b.countSequence!,
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'location.enabled',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], location: WarehouseLocation) => list.some(enabled => location.enabled === enabled),
      showFilter: true
    },
    {
      name: 'location.locked',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => this.utilService.compareBoolean(a.locked, b.locked),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], location: WarehouseLocation) => list.some(locked => location.locked === locked),
      showFilter: true
    },
    {
      name: 'location.reservedCode',
      sortOrder: null,
      sortFn: (a: WarehouseLocation, b: WarehouseLocation) => a.reservedCode!.localeCompare(b.reservedCode!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
  ];

  locationGroupTypes: LocationGroupType[] = [];
  locationGroups: LocationGroup[] = [];
  // Form related data and functions
  queryModal!: NzModalRef;
  searchForm!: UntypedFormGroup;

  searching = false;
  queryInProcess = false;
  searchResult = '';

  // Table data for display
  listOfAllLocations: WarehouseLocation[] = [];
  listOfDisplayLocations: WarehouseLocation[] = [];

  // Save filters that already selected
  selectedFiltersByLocationGroup: string[] = [];

  // list of checked checkbox

  setOfCheckedId = new Set<number>();

  @Output() readonly recordSelected: EventEmitter<any> = new EventEmitter();

  constructor(
    private fb: UntypedFormBuilder,
    private locationService: LocationService,
    private locationGroupTypeService: LocationGroupTypeService,
    private locationGroupService: LocationGroupService,
    private modalService: NzModalService,
    private utilService: UtilService,
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void { }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllLocations = [];
    this.listOfDisplayLocations = [];
  }

  search(): void {
    this.searching = true;
    this.locationService
      .getLocations(
        this.searchForm.value.taggedLocationGroupTypes,
        this.searchForm.value.taggedLocationGroups,
        this.searchForm.value.locationName,
      )
      .subscribe(
        locationRes => {
          this.listOfAllLocations = locationRes;
          this.listOfDisplayLocations = locationRes;
          this.setOfCheckedId.clear();

          this.searching = false;
          this.searchResult = this.i18n.fanyi('search_result_analysis', {
            currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
            rowCount: locationRes.length,
          });
        },
        () => {
          this.searching = false;
          this.searchResult = '';
        },
      );
  }


  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.clear();
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  currentPageDataChange(listOfDisplayLocations: WarehouseLocation[]): void {
    this.listOfDisplayLocations = listOfDisplayLocations;
  }


  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
  }


  isAnyRecordChecked(): boolean {
    return this.listOfDisplayLocations.some(location => this.setOfCheckedId.has(location.id!));
  }

  openQueryModal(
    tplQueryModalTitle: TemplateRef<{}>,
    tplQueryModalContent: TemplateRef<{}>,
    tplQueryModalFooter: TemplateRef<{}>,
  ): void {

    this.listOfAllLocations = [];
    this.listOfDisplayLocations = [];
    this.createQueryForm();

    // show the model
    this.queryModal = this.modalService.create({
      nzTitle: tplQueryModalTitle,
      nzContent: tplQueryModalContent,
      nzFooter: tplQueryModalFooter,

      nzWidth: 1000,
    });
  }
  createQueryForm(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      taggedLocationGroupTypes: [null],
      taggedLocationGroups: [null],
      locationName: [null],
    });

    // initiate the select control
    this.locationGroupTypeService.loadLocationGroupTypes().subscribe((locationGroupTypeList: LocationGroupType[]) => {
      this.locationGroupTypes = locationGroupTypeList;
    });
    this.locationGroupService.loadLocationGroups().subscribe((locationGroupList: LocationGroup[]) => {
      this.locationGroups = locationGroupList;
    });
  }
  closeQueryModal(): void {
    this.queryModal.destroy();
  }
  returnResult(): void {
    // get the selected record
    if (this.isAnyRecordChecked()) {
      this.recordSelected.emit(
        this.listOfDisplayLocations.filter(location => (this.setOfCheckedId.has(location.id!)))[0].name,
      );
    } else {
      this.recordSelected.emit('');
    }
    this.queryModal.destroy();
  }

  rowClicked(location: WarehouseLocation): void {
    // WHen the user click the row, if 
    // toggle the check box for this row
    if (this.setOfCheckedId.has(location.id!)) {
      this.updateCheckedSet(location.id!, false);
    }
    else {
      this.updateCheckedSet(location.id!, true);
    }
  }
}
