import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { UnitOfMeasure } from '../models/unit-of-measure';
import { NzInputDirective, NzModalService } from 'ng-zorro-antd';
import { I18NService } from '@core';
import { UnitOfMeasureService } from '../services/unit-of-measure.service';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-common-unit-of-measure',
  templateUrl: './unit-of-measure.component.html',
  styleUrls: ['./unit-of-measure.component.less'],
})
export class CommonUnitOfMeasureComponent implements OnInit {
  // Table data for display
  unitOfMeasures: UnitOfMeasure[] = [];
  listOfDisplayUnitOfMeasures: UnitOfMeasure[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByName = [];
  filtersByDescription = [];
  // Save filters that already selected
  selectedFiltersByName: string[] = [];
  selectedFiltersByDescription: string[] = [];

  // checkbox - select all
  allChecked = false;
  indeterminate = false;
  isAllDisplayDataChecked = false;
  // list of checked checkbox
  mapOfCheckedId: { [key: string]: boolean } = {};

  // editable cell
  editId: string | null;
  editCol: string | null;

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef;

  constructor(
    private unitOfMeasureService: UnitOfMeasureService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  search(refresh: boolean = false): void {
    this.unitOfMeasureService.loadUnitOfMeasures(refresh).subscribe(unitOfMeasureRes => {
      this.unitOfMeasures = unitOfMeasureRes;
      this.listOfDisplayUnitOfMeasures = unitOfMeasureRes;

      this.filtersByName = [];
      this.filtersByDescription = [];

      this.unitOfMeasures.forEach(unitOfMeasure => {
        this.filtersByName.push({ text: unitOfMeasure.name, value: unitOfMeasure.name });
        this.filtersByDescription.push({ text: unitOfMeasure.description, value: unitOfMeasure.description });
      });
    });
  }

  currentPageDataChange($event: UnitOfMeasure[]): void {
    this.listOfDisplayUnitOfMeasures = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayUnitOfMeasures.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayUnitOfMeasures.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayUnitOfMeasures.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByName: string[], selectedFiltersByDescription: string[]) {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.sortAndFilter();
  }
  sortAndFilter() {
    // filter data
    const filterFunc = (item: { id: number; name: string; description: string }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByDescription.length
        ? this.selectedFiltersByDescription.some(description => item.description.indexOf(description) !== -1)
        : true);

    const data = this.unitOfMeasures.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayUnitOfMeasures = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayUnitOfMeasures = data;
    }
  }

  removeSelectedUnitOfMeasures(): void {
    // make sure we have at least one checkbox checked
    const selectedUnitOfMeasures = this.getSelectedUnitOfMeasures();
    if (selectedUnitOfMeasures.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.unit-of-measure.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.unitOfMeasureService.removeUnitOfMeasures(selectedUnitOfMeasures).subscribe(res => {
            console.log('selected unit of measure are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedUnitOfMeasures(): UnitOfMeasure[] {
    const selectedUnitOfMeasures: UnitOfMeasure[] = [];
    this.unitOfMeasures.forEach((unitOfMeasure: UnitOfMeasure) => {
      if (this.mapOfCheckedId[unitOfMeasure.id] === true) {
        selectedUnitOfMeasures.push(unitOfMeasure);
      }
    });
    return selectedUnitOfMeasures;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeUnitOfMeasure(unitOfMeasure: UnitOfMeasure) {
    this.unitOfMeasureService
      .changeUnitOfMeasure(unitOfMeasure)
      .subscribe(res => console.log('unit of measure changed!'));
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void {
    if (this.editId && this.inputElement && this.inputElement.nativeElement !== e.target) {
      this.editId = null;
    }
  }

  ngOnInit() {
    this.search(true);
  }
  clearSessionUnitOfMeasure() {
    sessionStorage.removeItem('unit-of-measure-maintenance.unit-of-measure');
  }
  refresh() {
    this.search(true);
  }
}
