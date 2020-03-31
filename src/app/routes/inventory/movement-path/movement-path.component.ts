import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MovementPath } from '../models/movement-path';
import { I18NService } from '@core';
import { NzModalService } from 'ng-zorro-antd';
import { MovementPathService } from '../services/movement-path.service';
import { LocationGroup } from '../../warehouse-layout/models/location-group';
import { LocationGroupService } from '../../warehouse-layout/services/location-group.service';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-inventory-movement-path',
  templateUrl: './movement-path.component.html',
  styleUrls: ['./movement-path.component.less'],
})
export class InventoryMovementPathComponent implements OnInit {
  // Form related data and functions
  searchForm: FormGroup;

  // Table data for display
  listOfAllMovementPath: MovementPath[] = [];
  listOfDisplayMovementPath: MovementPath[] = [];
  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};
  // list of expanded row
  mapOfExpandedId: { [key: string]: boolean } = {};

  isCollapse = false;

  availableLocationGroups: LocationGroup[];

  toggleCollapse(): void {
    this.isCollapse = !this.isCollapse;
  }

  constructor(
    private fb: FormBuilder,
    private movementPathService: MovementPathService,
    private locationGroupService: LocationGroupService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

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
        console.log('movement path res:\n' + JSON.stringify(movementPaths));
      });
  }

  currentPageDataChange($event: MovementPath[]): void {
    this.listOfDisplayMovementPath = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayMovementPath.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayMovementPath.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayMovementPath.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayMovementPath = this.listOfAllMovementPath.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayMovementPath = this.listOfAllMovementPath;
    }
  }

  removeSelectedMovementPaths(): void {
    // make sure we have at least one checkbox checked
    const selectedMovementPaths = this.getSelectedMovementPaths();
    if (selectedMovementPaths.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.item.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.movementPathService.removeMovementPaths(selectedMovementPaths).subscribe(res => {
            console.log('selected movement paths removed');
            this.search();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedMovementPaths(): MovementPath[] {
    const selectedMovementPaths: MovementPath[] = [];
    this.listOfAllMovementPath.forEach((movementPath: MovementPath) => {
      if (this.mapOfCheckedId[movementPath.id] === true) {
        selectedMovementPaths.push(movementPath);
      }
    });
    return selectedMovementPaths;
  }

  ngOnInit() {
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
}
