import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { Role } from '../models/role';

@Component({
  selector: 'app-auth-role-maintenance',
  templateUrl: './role-maintenance.component.html',
})
export class AuthRoleMaintenanceComponent implements OnInit {
  currentRole: Role | undefined;
  pageTitle: string | undefined;

  emptyRole: Role = {
    id: 0,
    name: '',
    description: '',
    enabled: true,
    menuGroups: [],
    menus: [],
    users: [],
  };

  constructor(
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadRoleFromSessionStorage();
    this.setupPageTitle();
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
}
