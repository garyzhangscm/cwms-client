import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';
import { NzModalService, NzInputDirective } from 'ng-zorro-antd';
import { I18NService } from '@core';

interface ItemData {
  id: number;
  name: string;
  age: number;
  address: string;
}

@Component({
  selector: 'app-common-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.less'],
})
export class CommonClientComponent implements OnInit {
  // Table data for display
  clients: Client[] = [];
  listOfDisplayClients: Client[] = [];

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

  constructor(private clientService: ClientService, private i18n: I18NService, private modalService: NzModalService) {}

  search(refresh: boolean = false): void {
    this.clientService.loadClients(refresh).subscribe(clientRes => {
      this.clients = clientRes;
      this.listOfDisplayClients = clientRes;

      this.filtersByName = [];
      this.filtersByDescription = [];
      this.filtersByAddressCountry = [];
      this.filtersByAddressState = [];

      const existingCountries = new Set();
      const existingStates = new Set();

      this.clients.forEach(client => {
        this.filtersByName.push({ text: client.name, value: client.name });
        this.filtersByDescription.push({ text: client.description, value: client.description });

        if (!existingCountries.has(client.addressCountry)) {
          this.filtersByAddressCountry.push({
            text: client.addressCountry,
            value: client.addressCountry,
          });
          existingCountries.add(client.addressCountry);
        }
        if (!existingStates.has(client.addressState)) {
          this.filtersByAddressState.push({
            text: client.addressState,
            value: client.addressState,
          });
          existingStates.add(client.addressState);
        }
      });
    });
  }

  currentPageDataChange($event: Client[]): void {
    this.listOfDisplayClients = $event;
    this.refreshStatus();
  }
  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayClients.every(item => this.mapOfCheckedId[item.id]);
    this.indeterminate =
      this.listOfDisplayClients.some(item => this.mapOfCheckedId[item.id]) && !this.isAllDisplayDataChecked;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayClients.forEach(item => (this.mapOfCheckedId[item.id] = value));
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

    const data = this.clients.filter(item => filterFunc(item));

    // sort data
    if (this.sortKey && this.sortValue) {
      this.listOfDisplayClients = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortKey!] > b[this.sortKey!]
            ? 1
            : -1
          : b[this.sortKey!] > a[this.sortKey!]
          ? 1
          : -1,
      );
    } else {
      this.listOfDisplayClients = data;
    }
  }

  removeSelectedClients(): void {
    // make sure we have at least one checkbox checked
    const selectedClients = this.getSelectedClients();
    if (selectedClients.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.client.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.client.modal.delete.content'),
        nzOkText: this.i18n.fanyi('description.field.button.confirm'),
        nzOkType: 'danger',
        nzOnOk: () => {
          this.clientService.removeClients(selectedClients).subscribe(res => {
            console.log('selected clients are removed');
            this.refresh();
          });
        },
        nzCancelText: this.i18n.fanyi('description.field.button.cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedClients(): Client[] {
    const selectedClients: Client[] = [];
    this.clients.forEach((client: Client) => {
      if (this.mapOfCheckedId[client.id] === true) {
        selectedClients.push(client);
      }
    });
    return selectedClients;
  }

  startEdit(id: string, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeClient(client: Client) {
    this.clientService.changeClient(client).subscribe(res => console.log('client changed!'));
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
  clearSessionClient() {
    sessionStorage.removeItem('client-maintenance.client');
  }
  refresh() {
    this.search(true);
  }
}
