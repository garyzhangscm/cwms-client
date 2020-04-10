import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Customer } from '../models/customer';
import { NzInputDirective, NzModalService } from 'ng-zorro-antd';
import { SupplierService } from '../services/supplier.service';
import { I18NService } from '@core';
import { Supplier } from '../models/supplier';
import { CustomerService } from '../services/customer.service';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-common-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.less'],
})
export class CommonCustomerComponent implements OnInit {
  // Table data for display
  listOfAllCustomers: Customer[] = [];
  listOfDisplayCustomers: Customer[] = [];

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
    private customerService: CustomerService,
    private i18n: I18NService,
    private modalService: NzModalService,
  ) {}

  search(refresh: boolean = false): void {
    this.customerService.loadCustomers(refresh).subscribe(customerRes => {
      this.listOfAllCustomers = customerRes;
      this.listOfDisplayCustomers = customerRes;

      this.filtersByName = [];
      this.filtersByDescription = [];
      this.filtersByAddressCountry = [];
      this.filtersByAddressState = [];

      const existingCountries = new Set();
      const existingStates = new Set();

      this.listOfAllCustomers.forEach(customer => {
        this.filtersByName.push({ text: customer.name, value: customer.name });
        this.filtersByDescription.push({ text: customer.description, value: customer.description });

        if (!existingCountries.has(customer.addressCountry)) {
          this.filtersByAddressCountry.push({
            text: customer.addressCountry,
            value: customer.addressCountry,
          });
          existingCountries.add(customer.addressCountry);
        }
        if (!existingStates.has(customer.addressState)) {
          this.filtersByAddressState.push({
            text: customer.addressState,
            value: customer.addressState,
          });
          existingStates.add(customer.addressState);
        }
      });
    });
  }

  currentPageDataChange($event: Customer[]): void {
    this.listOfDisplayCustomers = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayCustomers.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayCustomers.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayCustomers.forEach(item => (this.mapOfCheckedId[item.id] = value));
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

    const data = this.listOfAllCustomers.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayCustomers = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayCustomers = data;
    }
  }

  removeSelectedCustomers(): void {
    // make sure we have at least one checkbox checked
    const selectedCustomers = this.getSelectedCustomers();
    if (selectedCustomers.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.supplier.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.customerService.removeCustomers(selectedCustomers).subscribe(res => {
            console.log('selected customers are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedCustomers(): Customer[] {
    const selectedCustomers: Customer[] = [];
    this.listOfAllCustomers.forEach((customer: Customer) => {
      if (this.mapOfCheckedId[customer.id] === true) {
        selectedCustomers.push(customer);
      }
    });
    return selectedCustomers;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeCustomer(customer: Customer) {
    this.customerService.changeCustomer(customer).subscribe(res => console.log('customer changed!'));
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
  clearSessionCustomer() {
    sessionStorage.removeItem('customer-maintenance.customer');
  }
  refresh() {
    this.search(true);
  }
}
