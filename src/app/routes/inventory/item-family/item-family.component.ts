import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ItemFamily } from '../models/item-family';
import { NzInputDirective, NzModalService } from 'ng-zorro-antd';
import { ItemFamilyService } from '../services/item-family.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-inventory-item-family',
  templateUrl: './item-family.component.html',
  styleUrls: ['./item-family.component.less'],
})
export class InventoryItemFamilyComponent implements OnInit {
  // Table data for display
  itemFamilies: ItemFamily[] = [];
  listOfDisplayItemFamilies: ItemFamily[] = [];

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
    private itemFamilyService: ItemFamilyService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  search(refresh: boolean = false): void {
    this.itemFamilyService.loadItemFamilies(refresh).subscribe(itemFamilyRes => {
      this.itemFamilies = itemFamilyRes;
      this.listOfDisplayItemFamilies = itemFamilyRes;

      this.filtersByName = [];
      this.filtersByDescription = [];

      this.itemFamilies.forEach(itemFamily => {
        this.filtersByName.push({ text: itemFamily.name, value: itemFamily.name });
        this.filtersByDescription.push({ text: itemFamily.description, value: itemFamily.description });
      });
    });
  }

  currentPageDataChange($event: ItemFamily[]): void {
    this.listOfDisplayItemFamilies = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayItemFamilies.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayItemFamilies.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayItemFamilies.forEach(item => (this.mapOfCheckedId[item.id] = value));
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
    const filterFunc = (item: { name: string; description: string }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByDescription.length
        ? this.selectedFiltersByDescription.some(description => item.description.indexOf(description) !== -1)
        : true);

    const data = this.itemFamilies.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayItemFamilies = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayItemFamilies = data;
    }
  }

  removeSelectedItemFamilies(): void {
    // make sure we have at least one checkbox checked
    const selectedItemFamilies = this.getSelectedItemFamilies();
    if (selectedItemFamilies.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.item-family.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.itemFamilyService.removeItemFamilies(selectedItemFamilies).subscribe(res => {
            console.log('selected item families are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedItemFamilies(): ItemFamily[] {
    const selectedItemFamilies: ItemFamily[] = [];
    this.itemFamilies.forEach((itemFamily: ItemFamily) => {
      if (this.mapOfCheckedId[itemFamily.id] === true) {
        selectedItemFamilies.push(itemFamily);
      }
    });
    return selectedItemFamilies;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeItemFamily(itemFamily: ItemFamily) {
    this.itemFamilyService.changeItemFamily(itemFamily).subscribe(res => console.log('item family changed!'));
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
  clearSessionItemFamily() {
    sessionStorage.removeItem('item-family-maintenance.item-family');
  }
  refresh() {
    this.search(true);
  }
}
