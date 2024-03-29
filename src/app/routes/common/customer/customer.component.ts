import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
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
  listOfColumns: Array<ColumnItem<Customer>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'listPickEnabledFlag',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => this.utilService.compareNullableObjField(a, b, "listPickEnabledFlag"),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.firstname',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.contactorFirstname.localeCompare(b.contactorFirstname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.lastname',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.contactorLastname.localeCompare(b.contactorLastname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'country',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressCountry.localeCompare(b.addressCountry),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'state',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressState.localeCompare(b.addressState),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'county',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressCounty!.localeCompare(b.addressCounty!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'city',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressCity.localeCompare(b.addressCity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'district',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressDistrict!.localeCompare(b.addressDistrict!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line1',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressLine1.localeCompare(b.addressLine1),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line2',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressLine2!.localeCompare(b.addressLine2!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'postcode',
      sortOrder: null,
      sortFn: (a: Customer, b: Customer) => a.addressPostcode.localeCompare(b.addressPostcode),
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
  searchForm!: UntypedFormGroup;
  isSpinning = false;

  // Table data for display
  listOfAllCustomers: Customer[] = [];
  listOfDisplayCustomers: Customer[] = [];


  // editable cell
  editId = -1;
  editCol = '';

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

  displayOnly = false;
  constructor(
    private customerService: CustomerService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private fb: UntypedFormBuilder,
    private activatedRoute: ActivatedRoute,
    private utilService: UtilService,
    private router: Router,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/common/customer").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );              
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      name: [null], 
    }); 
    
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllCustomers = [];
    this.listOfDisplayCustomers = [];
  }

  search(refresh: boolean = false): void {
    this.isSpinning = true;
    this.customerService.getCustomers(
      this.searchForm.controls.name.value).subscribe(
        {
          next: (customerRes) => {

            this.listOfAllCustomers = customerRes;
            this.listOfDisplayCustomers = customerRes;
            this.isSpinning = false;
          }, 
          error: () => this.isSpinning = false
        })
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
    this.listOfDisplayCustomers!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Customer[]): void {
    this.listOfDisplayCustomers! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayCustomers!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayCustomers!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }

  removeSelectedCustomers(): void {
    // make sure we have at least one checkbox checked
    const selectedCustomers = this.getSelectedCustomers();
    if (selectedCustomers.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.supplier.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
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
      if (this.setOfCheckedId.has(customer.id!)) {
        selectedCustomers.push(customer);
      }
    });
    return selectedCustomers;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
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

  clearSessionCustomer(): void {
    sessionStorage.removeItem('customer-maintenance.customer');
  }
  refresh(): void {
    this.search(true);
  }
  // before we start modify the customer, let's setup the 
  // customer and save it in the session
  // so that the modify page can get from the session
  setupSessionCustomer(id: number) : void {
    this.clearSessionCustomer();
    this.customerService.getCustomer(id).subscribe({
      next: (customerRes) => {

        sessionStorage.setItem('customer-maintenance.customer', JSON.stringify(customerRes));
        this.router.navigateByUrl(`/common/customer-maintenance`);
      }
    })
    

  }
}
