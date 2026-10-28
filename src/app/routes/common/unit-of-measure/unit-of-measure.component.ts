import { NzMessageService } from 'ng-zorro-antd/message';
import { Component, ElementRef, HostListener, inject, OnInit, ViewChild } from '@angular/core'; 
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { UnitOfMeasure } from '../models/unit-of-measure';
import { UnitOfMeasureService } from '../services/unit-of-measure.service';


@Component({
    selector: 'app-common-unit-of-measure',
    templateUrl: './unit-of-measure.component.html',
    styleUrls: ['./unit-of-measure.component.less'],
    standalone: false
})
export class CommonUnitOfMeasureComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  
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
  editId: number = -1;
  editCol = '';

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

  displayOnly = false;
  readonly isolatedTest = (globalThis as any).__MES_PUBLIC_CONFIG__?.masterDataTest === true;
  levelDrafts = new Map<number, UnitOfMeasure['level']>();
  savingLevelChanges = false;
  readonly levelMessage = inject(NzMessageService);
  draftLevel(unit: UnitOfMeasure): UnitOfMeasure['level'] {
    return this.levelDrafts.has(unit.id!) ? this.levelDrafts.get(unit.id!) : (unit.level || null);
  }
  changeUnitLevel(unit: UnitOfMeasure, level: UnitOfMeasure['level']): void {
    if (this.displayOnly || this.savingLevelChanges) return;
    const value = level || null;
    if (value === (unit.level || null)) this.levelDrafts.delete(unit.id!);
    else this.levelDrafts.set(unit.id!, value);
  }
  saveUnitLevels(): void {
    if (this.displayOnly || this.savingLevelChanges || !this.levelDrafts.size) return;
    const updates = this.unitOfMeasures.filter(unit => this.levelDrafts.has(unit.id!)).map(unit => ({
      id: unit.id!, level: this.levelDrafts.get(unit.id!) || null, _testRevision: unit._testRevision
    }));
    this.savingLevelChanges = true;
    this.unitOfMeasureService.saveUnitLevels(updates).subscribe({
      next: saved => {
        for (const unit of saved) {
          const row = this.unitOfMeasures.find(candidate => candidate.id === unit.id);
          if (row) Object.assign(row, unit);
          this.levelDrafts.delete(unit.id!);
        }
        this.savingLevelChanges = false;
        this.levelMessage.success(this.i18n.fanyi('uom.levels-saved'));
      },
      error: () => { this.savingLevelChanges = false; }
    });
  }
  constructor(
    private unitOfMeasureService: UnitOfMeasureService, 
    private modalService: NzModalService,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/common/unit-of-measure").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );                
  }

  search(refresh: boolean = false): void {
    this.unitOfMeasureService.loadUnitOfMeasures(refresh).subscribe(unitOfMeasureRes => {
      this.levelDrafts.clear();
      this.editId = -1;
      this.editCol = '';
      this.unitOfMeasures = unitOfMeasureRes;
      this.listOfDisplayUnitOfMeasures = unitOfMeasureRes;

      this.filtersByName = [];
      this.filtersByDescription = [];

    });
  }

  currentPageDataChange($event: UnitOfMeasure[]): void {
    this.listOfDisplayUnitOfMeasures = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayUnitOfMeasures.every(item => this.mapOfCheckedId[item.id!]);
    this.indeterminate =
      this.listOfDisplayUnitOfMeasures.some(item => this.mapOfCheckedId[item.id!]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayUnitOfMeasures.forEach(item => (this.mapOfCheckedId[item.id!] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(selectedFiltersByName: string[], selectedFiltersByDescription: string[]): void {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.sortAndFilter();
  }
  sortAndFilter(): void {
    // filter data
    const filterFunc = (item: { id?: number; name: string; description: string }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByDescription.length
        ? this.selectedFiltersByDescription.some(description => item.description.indexOf(description) !== -1)
        : true);

    const data = this.unitOfMeasures.filter(item => filterFunc(item));

  }

  removeSelectedUnitOfMeasures(): void {
    // make sure we have at least one checkbox checked
    const selectedUnitOfMeasures = this.getSelectedUnitOfMeasures();
    if (selectedUnitOfMeasures.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.unit-of-measure.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.unitOfMeasureService.removeUnitOfMeasures(selectedUnitOfMeasures).subscribe(res => {
            console.log('selected unit of measure are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedUnitOfMeasures(): UnitOfMeasure[] {
    const selectedUnitOfMeasures: UnitOfMeasure[] = [];
    this.unitOfMeasures.forEach((unitOfMeasure: UnitOfMeasure) => {
      if (this.mapOfCheckedId[unitOfMeasure.id!] === true) {
        selectedUnitOfMeasures.push(unitOfMeasure);
      }
    });
    return selectedUnitOfMeasures;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
    if (this.displayOnly || this.savingLevelChanges) return;
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeUnitOfMeasure(unitOfMeasure: UnitOfMeasure): void {
    this.unitOfMeasureService
      .changeUnitOfMeasure(unitOfMeasure)
      .subscribe({ next: res => { Object.assign(unitOfMeasure, res); this.editId = -1; this.editCol = ''; }, error: () => this.search(true) });
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void {
  }

  ngOnInit(): void {
    this.search(true);
  }
  clearSessionUnitOfMeasure(): void {
    sessionStorage.removeItem('unit-of-measure-maintenance.unit-of-measure');
  }
  refresh(): void {
    this.search(true);
  }
}
