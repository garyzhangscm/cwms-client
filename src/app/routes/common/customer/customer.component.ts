import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Customer } from '../models/customer';
import { Supplier } from '../models/supplier';
import { CustomerService } from '../services/customer.service';
import { SupplierService } from '../services/supplier.service';




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
  editId = '';
  editCol = '';

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

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
  ): void {
    this.selectedFiltersByName = selectedFiltersByName;
    this.selectedFiltersByDescription = selectedFiltersByDescription;
    this.selectedFiltersByCountry = selectedFiltersByCountry;
    this.selectedFiltersByState = selectedFiltersByState;
    this.sortAndFilter();
  }
  sortAndFilter(): void {
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

  changeCustomer(customer: Customer): void {
    this.customerService.changeCustomer(customer).subscribe(res => console.log('customer changed!'));
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void { 
  }

  ngOnInit(): void {
    this.search(true);
  }
  clearSessionCustomer(): void{
    sessionStorage.removeItem('customer-maintenance.customer');
  }
  refresh(): void {
    this.search(true);
  }
}
