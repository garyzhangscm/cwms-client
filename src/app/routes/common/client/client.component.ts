import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { I18NService } from '@core';
import { _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ColumnItem } from '../../util/models/column-item';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';
 
@Component({
  selector: 'app-common-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.less'],
})
export class CommonClientComponent implements OnInit {
  listOfColumns: ColumnItem[] = [    
    {
          name: 'name',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.name.localeCompare(b.name),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'description',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.description.localeCompare(b.description),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'contactor.firstname',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.contactorFirstname.localeCompare(b.contactorFirstname),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'contactor.lastname',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.contactorLastname.localeCompare(b.contactorLastname),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'country',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressCountry.localeCompare(b.addressCountry),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'state',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressState.localeCompare(b.addressState),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'county',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressCounty!.localeCompare(b.addressCounty!),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'city',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressCity.localeCompare(b.addressCity),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'district',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressDistrict!.localeCompare(b.addressDistrict!),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'line1',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressLine1.localeCompare(b.addressLine1),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'line2',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressLine2!.localeCompare(b.addressLine2!),
          sortDirections: ['ascend', 'descend'],
          filterMultiple: true,
          listOfFilter: [],
          filterFn: null, 
          showFilter: false
        },
        {
          name: 'postcode',
          sortOrder: null,
          sortFn: (a: Client, b: Client) => a.addressPostcode.localeCompare(b.addressPostcode),
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

  // Table data for display
  clients: Client[] = [];
  listOfDisplayClients: Client[] = [];
 

  // editable cell
  editId = '';
  editCol = '';

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

  constructor(private clientService: ClientService, private i18n: I18NService, private modalService: NzModalService) {}

  search(refresh: boolean = false): void {
    this.clientService.loadClients(refresh).subscribe(clientRes => {
      this.clients = clientRes;
      this.listOfDisplayClients = clientRes;
     
      
    });
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
    this.listOfDisplayClients!.forEach(item => this.updateCheckedSet(item.id, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Client[]): void {
    this.listOfDisplayClients! = $event;
    this.refreshCheckedStatus();
  }
  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayClients!.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfDisplayClients!.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
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
      if (this.setOfCheckedId.has(client.id)) {
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

  changeClient(client: Client): void {
    this.clientService.changeClient(client).subscribe(res => console.log('client changed!'));
  }

  @HostListener('window:click', ['$event'])
  handleClick(e: MouseEvent): void { 
  }

  ngOnInit(): void {
    this.search(true);
  }
  clearSessionClient(): void {
    sessionStorage.removeItem('client-maintenance.client');
  }
  refresh(): void {
    this.search(true);
  }
}
