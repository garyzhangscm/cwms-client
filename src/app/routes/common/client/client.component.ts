import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { ColumnItem } from '../../util/models/column-item';
import { LocalCacheService } from '../../util/services/local-cache.service';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
  selector: 'app-common-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.less'],
})
export class CommonClientComponent implements OnInit {
  listOfColumns: Array<ColumnItem<Client>> = [
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

  
  threePartyLogisticsFlag: boolean = false;

  // editable cell
  editId = -1;
  editCol = '';
  isSpinning = false;
  searchForm!: FormGroup;

  @ViewChild(NzInputDirective, { static: false, read: ElementRef }) inputElement: ElementRef | undefined;

  constructor(private clientService: ClientService,
    private localCacheService: LocalCacheService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private modalService: NzModalService) { 
      this.localCacheService.getWarehouseConfiguration().subscribe({
        next: (warehouseConfigRes) => {

          this.threePartyLogisticsFlag = warehouseConfigRes.threePartyLogisticsFlag;
        }
      })
    }

  ngOnInit(): void {
      this.searchForm = this.fb.group({
        name: [null], 
      });  
      
    // IN case we get the number passed in, refresh the display
    // and show the client information
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.name) {
        this.searchForm.controls.name.setValue(params.name);
        this.search();
      }
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.clients = [];
    this.listOfDisplayClients = [];

  }
  search(): void {
    this.isSpinning = true;
    this.clientService.getClients(
      this.searchForm.controls.name.value).subscribe({
        next: (clientRes) => {
          this.clients = clientRes;
          this.listOfDisplayClients = clientRes;
          this.isSpinning = false;
        
        }, 
        error: () => this.isSpinning = false
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
    this.listOfDisplayClients!.forEach(item => this.updateCheckedSet(item.id!, value));
    this.refreshCheckedStatus();
  }

  currentPageDataChange($event: Client[]): void {
    this.listOfDisplayClients! = $event;
    this.refreshCheckedStatus();
  }
  refreshCheckedStatus(): void {
    this.checked = this.listOfDisplayClients!.every(item => this.setOfCheckedId.has(item.id!));
    this.indeterminate = this.listOfDisplayClients!.some(item => this.setOfCheckedId.has(item.id!)) && !this.checked;
  }

  removeSelectedClients(): void {
    // make sure we have at least one checkbox checked
    const selectedClients = this.getSelectedClients();
    if (selectedClients.length > 0) {
      this.modalService.confirm({
        nzTitle: this.i18n.fanyi('page.client.modal.delete.header.title'),
        nzContent: this.i18n.fanyi('page.client.modal.delete.content'),
        nzOkText: this.i18n.fanyi('confirm'),
        nzOkDanger: true,
        nzOnOk: () => {
          console.log(`start to remove selected client ${JSON.stringify(selectedClients)}`);

          this.isSpinning = true;
          this.clientService.removeClients(selectedClients).subscribe({
            next: () => {
              this.messageService.success(this.i18n.fanyi('message.action.success'));
              this.isSpinning = false;
              this.search();
            
            }, 
            error: () => this.isSpinning = false
          }); 
        },
        nzCancelText: this.i18n.fanyi('cancel'),
        nzOnCancel: () => console.log('Cancel'),
      });
    }
  }

  getSelectedClients(): Client[] {
    const selectedClients: Client[] = [];
    this.clients.forEach((client: Client) => {
      if (this.setOfCheckedId.has(client.id!)) {
        selectedClients.push(client);
      }
    });
    return selectedClients;
  }

  startEdit(id: number, col: string, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.editId = id;
    this.editCol = col;
  }

  changeClient(client: Client): void {
    this.clientService.changeClient(client).subscribe(res => console.log('client changed!'));
  }
 
}
