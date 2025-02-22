import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder,  UntypedFormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';
import { MovementPath } from '../models/movement-path';
import { MovementPathService } from '../services/movement-path.service';


@Component({
    selector: 'app-inventory-movement-path',
    templateUrl: './movement-path.component.html',
    styleUrls: ['./movement-path.component.less'],
    standalone: false
})
export class InventoryMovementPathComponent implements OnInit {

  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  listOfColumns: Array<ColumnItem<MovementPath>> = [
    {
      name: 'sequence',
      showSort: true,
      sortOrder: null,
      sortFn: (a: MovementPath, b: MovementPath) => this.utilService.compareNullableNumber(a.sequence, b.sequence),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'from-location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: MovementPath, b: MovementPath) => this.utilService.compareNullableObjField(a.fromLocation, b.fromLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'to-location',
      showSort: true,
      sortOrder: null,
      sortFn: (a: MovementPath, b: MovementPath) => this.utilService.compareNullableObjField(a.toLocation, b.toLocation, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'from-location-group',
      showSort: true,
      sortOrder: null,
      sortFn: (a: MovementPath, b: MovementPath) => this.utilService.compareNullableObjField(a.fromLocationGroup, b.fromLocationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    }, {
      name: 'to-location-group',
      showSort: true,
      sortOrder: null,
      sortFn: (a: MovementPath, b: MovementPath) => this.utilService.compareNullableObjField(a.toLocationGroup, b.toLocationGroup, 'name'),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },

  ];

  listOfSelection = [
    {
      text: this.i18n.fanyi(`select-all-rows`),
      onSelect: () => {
        this.onAllChecked(true);
      }
    },
  ];
  setOfCheckedId = new Set<number>();
  checked = false;
  indeterminate = false;

  expandSet = new Set<number>();


  // Form related data and functions
  searchForm!: UntypedFormGroup;

  // Table data for display
  listOfAllMovementPath: MovementPath[] = [];
  listOfDisplayMovementPath: MovementPath[] = [];


  isCollapse = false;

  availableLocationGroups: LocationGroup[] = [];

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  displayOnly = false;
  constructor(
    private fb: UntypedFormBuilder,
    private movementPathService: MovementPathService,
    private locationGroupService: LocationGroupService, 
    private modalService: NzModalService,
    private utilService: UtilService,
    private userService: UserService,
  ) {
    userService.isCurrentPageDisplayOnly("/inventory/movement-path").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                
  
  }

  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllMovementPath = [];
    this.listOfDisplayMovementPath = [];
  }
  search(): void {
    this.movementPathService
      .getMovementPaths(
        this.searchForm.value.fromLocation,
        this.searchForm.value.toLocation,
        this.searchForm.value.fromLocationGroup,
        this.searchForm.value.toLocationGroup,
      )
      .subscribe(movementPaths => {
        this.listOfAllMovementPath = movementPaths;
        this.listOfDisplayMovementPath = movementPaths;
        console.log(`movement path res:\n${  JSON.stringify(movementPaths)}`);
      });
  }

  currentPageDataChange($event: MovementPath[]): void {
    this.listOfDisplayMovementPath = $event;
    this.refreshCheckedStatus();
  }
  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  onItemChecked(id: number, checked: boolean): void {
    this.updateCheckedSet(id, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(value: boolean): void {
    this.listOfDisplayMovementPath!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }


  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayMovementPath!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayMovementPath!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
  }


  removeSelectedMovementPaths(): void {
    // make sure we have at least one checkbox checked
    const selectedMovementPaths = this.getSelectedMovementPaths();
    if (selectedMovementPaths.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.item.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.movementPathService.removeMovementPaths(selectedMovementPaths).subscribe(res => {
            console.log('selected movement paths removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedMovementPaths(): MovementPath[] {
    const selectedMovementPaths: MovementPath[] = [];
    this.listOfAllMovementPath.forEach((movementPath: MovementPath) => {
      if (this.setOfCheckedId.has(movementPath.id)) {
        selectedMovementPaths.push(movementPath);
      }
    });
    return selectedMovementPaths;
  }

  ngOnInit(): void {
    // initiate the search form
    this.searchForm = this.fb.group({
      fromLocation: [null],
      toLocation: [null],
      fromLocationGroup: [null],
      toLocationGroup: [null],
    });

    this.locationGroupService
      .loadLocationGroups()
      .subscribe(locationGroups => (this.availableLocationGroups = locationGroups));
  }
  onExpandChange(id: number, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id);
    } else {
      this.expandSet.delete(id);
    }
  }
}
