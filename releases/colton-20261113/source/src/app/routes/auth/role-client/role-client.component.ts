import { Component, inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN,  TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransferItem } from 'ng-zorro-antd/transfer';

import { Client } from '../../common/models/client';
import { ClientService } from '../../common/services/client.service';
import { LocalCacheService } from '../../util/services/local-cache.service'; 
import { Role } from '../models/role';
import { RoleService } from '../services/role.service';

@Component({
    selector: 'app-auth-role-client',
    templateUrl: './role-client.component.html',
    standalone: false
})
export class AuthRoleClientComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  pageTitle: string;
  clientsList: TransferItem[] = []; 
  currentRole: Role | undefined; 
  // map to save all clients defined in the system
  // key: client id
  // value: client
  allClients: Map<number, Client> = new Map();
  accessibleClientIds: number[] = [];
  unassignedClientText: string;
  assignedClientText: string; 
  newRole = false;
  previousPage: string | undefined;

  threePartyLogisticsFlag = false;

  isSpinning = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private localCacheService: LocalCacheService,
    private titleService: TitleService,
    private fb: UntypedFormBuilder,
    private roleService: RoleService,
    private clientService: ClientService,
    private messageService: NzMessageService,
    private router: Router,
  ) {
    this.pageTitle = this.i18n.fanyi('page.auth.role.clients');
    this.unassignedClientText = this.i18n.fanyi('unassigned-clients');
    this.assignedClientText = this.i18n.fanyi('assigned-client');

  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.auth.role.clients'));

    this.activatedRoute.queryParams.subscribe(params => {
      if (params['roleId']) {
        // Get the role and initiate the menu assignment
        this.roleService.getRole(params['roleId']).subscribe(roleRes => {
          this.currentRole = roleRes;
          this.initClientAssignment();
          this.newRole = false;
          this.previousPage = `/auth/role?name=${this.currentRole.name}`;
        });
      }
      if (params.hasOwnProperty('new-role')) {
        this.newRole = true;
        this.currentRole = JSON.parse(sessionStorage.getItem('role-maintenance.role')!);
        this.initClientAssignment();
        this.previousPage = `/auth/role`;
      }
    });

    
  }

  initClientAssignment(): void {
    
    this.isSpinning = true;
    this.localCacheService.getWarehouseConfiguration().subscribe({
      next: (warehouseConfigRes) => {

        if (warehouseConfigRes && warehouseConfigRes.threePartyLogisticsFlag) {
          this.threePartyLogisticsFlag = true;
        }
        else {
          this.threePartyLogisticsFlag = false;
        }
        if (this.threePartyLogisticsFlag) {
            this.initClientAssignmentFor3plWarehouse();
        } 
        this.isSpinning = false;
      }, 
      error: () => this.isSpinning = false
    });
    
  }

  initClientAssignmentFor3plWarehouse(): void {
    // Get all clients and accessible menus by role
 
    this.clientsList = []; 
    this.clientService.getClients().subscribe({

      next: (clientRes) =>{
        clientRes.forEach(
          client => {
             
            this.allClients.set(client.id!, client);
            const clientAssigned = this.currentRole!.clientAccesses.some(clientAccess => clientAccess.clientId === client.id) ;
            if (clientAssigned) {
              this.accessibleClientIds.push(client.id!);
            } 
            this.clientsList = [...this.clientsList, 
              {
              key: client.id!.toString(),
              title: `${client.name}`,
              description: `${client.description}`,
              direction: clientAssigned ? 'right' : undefined,
            }];
          }
        )
      }
    });  
  }
 
  transferListFilterOption(inputValue: string, item: any): boolean {
    return item.title.indexOf(inputValue) > -1;
  }

  transferListSearch(ret: {}): void {
    console.log('nzSearchChange', ret);
  }

  transferListSelect(ret: {}): void {
    console.log('nzSelectChange', ret);
  }

  transferListChange(ret: {}): void {
    console.log('nzChange', ret);
  }

  assignClients(): void { 
    this.isSpinning = true;
    const currentAssignedClientIds = [...this.clientsList.filter(item => item.direction === 'right').map(item => item['key'])]; 

       
    const newlyAssignedClientIds = currentAssignedClientIds.filter(
      id => !this.accessibleClientIds.some(accessibleClientId => accessibleClientId === +id),
    );

    const newlyDeassignedClientIds = this.accessibleClientIds.filter(
      accessibleClientId => !currentAssignedClientIds.some(id => accessibleClientId === +id),
    );

    this.roleService.processClients(
      this.currentRole!.id, 
      newlyAssignedClientIds, 
      newlyDeassignedClientIds, 
      this.currentRole!.nonClientDataAccessible, 
      this.currentRole!.allClientAccess).subscribe(
      {
        next: () => {
          
          this.messageService.success(this.i18n.fanyi('message.action.success'));
          setTimeout(() => {
            this.isSpinning = false;
            this.router.navigateByUrl(this.previousPage!);
          }, 500);
        }, 
        error: () => this.isSpinning = false
      });
  }

  goToNextPage(): void {
    this.isSpinning = true;
    
    const currentAssignedClientIds = [...this.clientsList.filter(item => item.direction === 'right').map(item => item['key'])]; 

    // refresh the client access
    this.currentRole!.clientAccesses = [];
    this.allClients.forEach((client, clientId) => {
      if (currentAssignedClientIds.includes(clientId.toString())) {
          // add the client to current role if it is assigned 
          this.currentRole!.clientAccesses = [...this.currentRole!.clientAccesses, 
              {
                clientId: clientId,
                client: client,
              }
          ]  
      }
    });
    
    sessionStorage.setItem('role-maintenance.role', JSON.stringify(this.currentRole));
    const url = '/auth/role/maintenance/confirm?new-role';
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
      case 1:
        this.router.navigateByUrl('/auth/role-user?new-role');
        break;
      case 2:
        this.router.navigateByUrl('/auth/role-menu?new-role');
        break;
      default:
        this.router.navigateByUrl('/auth/role/maintenance?new-role');
        break;
    }
  }
  return(): void {
    this.router.navigateByUrl(this.previousPage!);
  }
}
