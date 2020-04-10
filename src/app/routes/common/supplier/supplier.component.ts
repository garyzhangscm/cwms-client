import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Supplier } from '../models/supplier';
import { NzInputDirective, NzModalService } from 'ng-zorro-antd';
import { SupplierService } from '../services/supplier.service';
import { I18NService } from '@core';

@Component({
  selector: 'app-common-supplier',
  templateUrl: './supplier.component.html',
  styleUrls: ['./supplier.component.less'],
})
export class CommonSupplierComponent implements OnInit {
  // Table data for display
  listOfAllSuppliers: Supplier[] = [];
  listOfDisplaySuppliers: Supplier[] = [];

  // Sort key: field's nzSortKey value
  // sort value: ascend / descend
  sortKey: string | null = null;
  sortValue: string | null = null;
  // Filters meta data
  filtersByName = [];
  filtersByDescription = [];
  filtersByAddressCountry = [];
  filtersByAddressState = [];
  // Save filters that already selected
  selectedFiltersByName: string[] = [];
  selectedFiltersByDescription: string[] = [];
  selectedFiltersByCountry: string[] = [];
  selectedFiltersByState: string[] = [];

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
    private supplierService: SupplierService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  search(refresh: boolean = false): void {
    this.supplierService.loadSuppliers(refresh).subscribe(supplierRes => {
      this.listOfAllSuppliers = supplierRes;
      this.listOfDisplaySuppliers = supplierRes;

      this.filtersByName = [];
      this.filtersByDescription = [];
      this.filtersByAddressCountry = [];
      this.filtersByAddressState = [];

      const existingCountries = new Set();
      const existingStates = new Set();

      this.listOfAllSuppliers.forEach(supplier => {
        this.filtersByName.push({ text: supplier.name, value: supplier.name });
        this.filtersByDescription.push({ text: supplier.description, value: supplier.description });

        if (!existingCountries.has(supplier.addressCountry)) {
          this.filtersByAddressCountry.push({
            text: supplier.addressCountry,
            value: supplier.addressCountry,
          });
          existingCountries.add(supplier.addressCountry);
        }
        if (!existingStates.has(supplier.addressState)) {
          this.filtersByAddressState.push({
            text: supplier.addressState,
            value: supplier.addressState,
          });
          existingStates.add(supplier.addressState);
        }
      });
    });
  }

  currentPageDataChange($event: Supplier[]): void {
    this.listOfDisplaySuppliers = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplaySuppliers.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplaySuppliers.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplaySuppliers.forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  sort(sort: { key: string; value: string }): void {
    this.sortKey = sort.key;
    this.sortValue = sort.value;
    this.sortAndFilter();
  }

  filter(
    selectedFiltersByName: string[],
    selectedFiltersByDescription: string[],
    selectedFiltersByCountry: string[],
    selectedFiltersByState: string[],
  ) {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.selectedFiltersByCountry = selectedFiltersByCountry;
    this.selectedFiltersByState = selectedFiltersByState;
    this.sortAndFilter();
  }
  sortAndFilter() {
    // filter data
    const filterFunc = (item: {
      id: number;
      name: string;
      description: string;
      addressCountry: string;
      addressState: string;
    }) =>
      (this.selectedFiltersByName.length
        ? this.selectedFiltersByName.some(name => item.name.indexOf(name) !== -1)
        : true) &&
      (this.selectedFiltersByDescription.length
        ? this.selectedFiltersByDescription.some(description => item.description.indexOf(description) !== -1)
        : true) &&
      (this.selectedFiltersByCountry.length
        ? this.selectedFiltersByCountry.some(addressCountry => item.addressCountry.indexOf(addressCountry) !== -1)
        : true) &&
      (this.selectedFiltersByState.length
        ? this.selectedFiltersByState.some(addressState => item.addressState.indexOf(addressState) !== -1)
        : true);

    const data = this.listOfAllSuppliers.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplaySuppliers = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplaySuppliers = data;
    }
  }

  removeSelectedSuppliers(): void {
    // make sure we have at least one checkbox checked
    const selectedSuppliers = this.getSelectedSuppliers();
    if (selectedSuppliers.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.supplier.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.supplierService.removeSuppliers(selectedSuppliers).subscribe(res => {
            console.log('selected suppliers are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedSuppliers(): Supplier[] {
    const selectedSuppliers: Supplier[] = [];
    this.listOfAllSuppliers.forEach((supplier: Supplier) => {
      if (this.mapOfCheckedId[supplier.id] === true) {
        selectedSuppliers.push(supplier);
      }
    });
    return selectedSuppliers;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeSupplier(supplier: Supplier) {
    this.supplierService.changeSupplier(supplier).subscribe(res => console.log('supplier changed!'));
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
  clearSessionSupplier() {
    sessionStorage.removeItem('supplier-maintenance.supplier');
  }
  refresh() {
    this.search(true);
  }
}
