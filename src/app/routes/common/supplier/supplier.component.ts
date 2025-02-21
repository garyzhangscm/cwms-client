import { formatDate } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service';
import { ColumnItem } from '../../util/models/column-item';
import { Supplier } from '../models/supplier';
import { SupplierService } from '../services/supplier.service';

@Component({
    selector: 'app-common-supplier',
    templateUrl: './supplier.component.html',
    styleUrls: ['./supplier.component.less'],
    standalone: false
})
export class CommonSupplierComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Supplier>> = [
    {
      name: 'name',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.firstname',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.contactorFirstname.localeCompare(b.contactorFirstname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'contactor.lastname',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.contactorLastname.localeCompare(b.contactorLastname),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'country',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressCountry.localeCompare(b.addressCountry),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'state',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressState.localeCompare(b.addressState),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'county',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressCounty!.localeCompare(b.addressCounty!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'city',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressCity.localeCompare(b.addressCity),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'district',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressDistrict!.localeCompare(b.addressDistrict!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line1',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressLine1.localeCompare(b.addressLine1),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'line2',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressLine2!.localeCompare(b.addressLine2!),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'postcode',
      showSort: true,
      sortOrder: null,
      sortFn: (a: Supplier, b: Supplier) => a.addressPostcode.localeCompare(b.addressPostcode),
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
  listOfAllSuppliers: Supplier[] = [];
  listOfDisplaySuppliers: Supplier[] = [];


  // editable cell
  editId = -1;
  editCol = '';
  searchResult = "";

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

  displayOnly = false;
  constructor(
    private supplierService: SupplierService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private userService: UserService,
  ) { 
    userService.isCurrentPageDisplayOnly("/common/supplier").then(
      displayOnlyFlag => this.displayOnly = displayOnlyFlag
    );               
  }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      name: [null], 
    }); 
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm!.controls.name.setValue(params.name);
        this.search();
      }
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.listOfAllSuppliers = [];
    this.listOfDisplaySuppliers = [];
  }

  search(refresh: boolean = false): void {
    this.isSpinning = true;

    this.supplierService.getSuppliers(
      this.searchForm.controls.name.value).subscribe(
        {
          next: (supplierRes) => {

            this.listOfAllSuppliers = supplierRes;
            this.listOfDisplaySuppliers = supplierRes;
            this.searchResult = this.i18n.fanyi('search_result_analysis', {
              currentDate: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US'),
              rowCount: supplierRes.length
            });
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
    this.listOfDisplaySuppliers!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Supplier[]): void {
    this.listOfDisplaySuppliers! = $event;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplaySuppliers!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplaySuppliers!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }

  removeSelectedSuppliers(): void {
    // make sure we have at least one checkbox checked
    const selectedSuppliers = this.getSelectedSuppliers();
    if (selectedSuppliers.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.supplier.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          this.isSpinning = true;
          this.supplierService.removeSuppliers(selectedSuppliers).subscribe({
            next: () => {
              console.log('selected suppliers are removed');
              this.isSpinning = false;
              this.refresh();

            }, 
            error: () => this.isSpinning = false
          }) 
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedSuppliers(): Supplier[] {
    const selectedSuppliers: Supplier[] = [];
    this.listOfAllSuppliers.forEach((supplier: Supplier) => {
      if (this.setOfCheckedId.has(supplier.id!)) {
        selectedSuppliers.push(supplier);
      }
    });
    return selectedSuppliers;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeSupplier(supplier: Supplier): void {
    this.supplierService.changeSupplier(supplier).subscribe(res => console.log('supplier changed!'));
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void {
  }

  clearSessionSupplier(): void {
    sessionStorage.removeItem('supplier-maintenance.supplier');
  }
  refresh(): void {
    this.search(true);
  }
}
