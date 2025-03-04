import { Component,  inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder,   UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { STColumn, STComponent } from '@delon/abc/st';
import { ALAIN_I18N_TOKEN, _HttpClient } from '@delon/theme'; 
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

import { UserService } from '../../auth/services/user.service'; 
import { LocalCacheService } from '../../util/services/local-cache.service';
import { Client } from '../models/client';
import { ClientService } from '../services/client.service';

@Component({
    selector: 'app-common-client',
    templateUrl: './client.component.html',
    styleUrls: ['./client.component.less'],
    standalone: false
})
export class CommonClientComponent implements OnInit {

  
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  

  @ViewChild('st', { static: true })
  st!: STComponent;
  clientTableColumns: STColumn[] = [ 
    { title: this.i18n.fanyi("name"),  index: 'name'   }, 
    { title: this.i18n.fanyi("description"),  index: 'description' },  
    {
      title: this.i18n.fanyi("address"), 
      render: 'addressColumn',  
    },     
    { title: this.i18n.fanyi("listPickEnabledFlag"),  index: 'listPickEnabledFlag' },   
    {
      title: this.i18n.fanyi("action"),  
      render: 'actionColumn', 
    }
  ];  

 
 
  indeterminate = false;

  // Table data for display
  clients: Client[] = []; 
 
  threePartyLogisticsFlag: boolean = false;
 
  isSpinning = false;
  searchForm!: UntypedFormGroup;
  
  displayOnly = false;
  constructor(private clientService: ClientService,
    private localCacheService: LocalCacheService,
    private messageService: NzMessageService,
    private activatedRoute: ActivatedRoute,
    private fb: UntypedFormBuilder,
    private userService: UserService,
    private modalService: NzModalService) { 
      userService.isCurrentPageDisplayOnly("/common/client").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );             
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
      if (params['name']) {
        this.searchForm.value.name.setValue(params['name']);
        this.search();
      }
    });
  }
  resetForm(): void {
    this.searchForm.reset();
    this.clients = []; 

  }
  search(): void {
    this.isSpinning = true;
    this.clientService.getClients(
      this.searchForm.value.name).subscribe({
        next: (clientRes) => {
          this.clients = clientRes; 
          this.isSpinning = false;
        
        }, 
        error: () => this.isSpinning = false
      });
  }
      

  removeClient(clientId: number): void {
    this.isSpinning = true;
    this.clientService.removeClient(clientId).subscribe(
      {
        next: () => {
          this.isSpinning = false;
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          this.search();
        }, 
        error: () => this.isSpinning = false
      }
    );
  }
 
}
