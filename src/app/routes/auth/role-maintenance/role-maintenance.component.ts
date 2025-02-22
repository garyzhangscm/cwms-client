import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Role } from '../models/role';
import { RoleService } from '../services/role.service';

@Component({
    selector: 'app-auth-role-maintenance',
    templateUrl: './role-maintenance.component.html',
    standalone: false
})
export class AuthRoleMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentRole: Role | undefined;
  pageTitle: string | undefined;
  roleNameValidateStatus = 'warning'; 
  roleNameValidationMessage = '';

  emptyRole: Role = {
    id: 0,
    name: '',
    companyId: this.companyService.getCurrentCompany()!.id,
    description: '',
    enabled: true,
    menuGroups: [],
    menus: [],
    users: [],
    clientAccesses:  [], 
    nonClientDataAccessible: false,
    allClientAccess:  true,
    roleMenus: [], 
    rolePermissions: [], 
    operationTypes: []
  };

  constructor(
    private router: Router,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService,
    private companyService: CompanyService,
  ) { }

  ngOnInit(): void {
    this.loadRoleFromSessionStorage();
    this.setupPageTitle();
    this.roleNameValidateStatus === 'success'
    this.roleNameValidationMessage = '';
  }

  loadRoleFromSessionStorage(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentRole = params.hasOwnProperty('new-role')
        ? sessionStorage.getItem('role-maintenance.role') === null
          ? this.emptyRole
          : JSON.parse(sessionStorage.getItem('role-maintenance.role')!)
        : this.emptyRole;
    });
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.role.add.title'));
    this.pageTitle = this.i18n.fanyi('page.role.add.title');
  }
  goToNextPage(): void {
    sessionStorage.setItem('role-maintenance.role', JSON.stringify(this.currentRole));
    const url = '/auth/role-user?new-role';
    this.router.navigateByUrl(url);
  }

  
  roleNameChange(event: Event) {
    // assign the value to the order, in case we press key to let the system
    // generate the next order number
    this.currentRole!.name = (event.target as HTMLInputElement).value; 
    if (this.currentRole!.name) {
      // THE USER input the order number, let's make sure it is not exists yet
      this.roleService.getRoles(this.currentRole!.name).subscribe({
        next: (roleRes) => { 
          if (roleRes.length > 0) {
            // the order is already exists 
            this.roleNameValidateStatus = 'error'
            this.roleNameValidationMessage = 'nameExists';
          }
          else {
          
            this.roleNameValidateStatus = 'success'
          }
        }
      })
    }
    else {
      this.roleNameValidateStatus = 'required'
    }
  }
  passValidation() : boolean {
 
      return this.roleNameValidateStatus === 'success'; 
  }
}
