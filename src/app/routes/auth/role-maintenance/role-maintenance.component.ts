import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Role } from '../models/role';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-auth-role-maintenance',
  templateUrl: './role-maintenance.component.html',
})
export class AuthRoleMaintenanceComponent implements OnInit {
  currentRole: Role;
  pageTitle: string;

  emptyRole: Role = {
    id: 0,
    name: '',
    description: '',
    enabled: true,
    menuGroups: [],
    users: [],
  };

  constructor(
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadRoleFromSessionStorage();
    this.setupPageTitle();
  }

  loadRoleFromSessionStorage() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentRole = params.hasOwnProperty('new-role')
        ? sessionStorage.getItem('role-maintenance.role') === null
          ? this.emptyRole
          : JSON.parse(sessionStorage.getItem('role-maintenance.role'))
        : this.emptyRole;
    });
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.role.add.title'));
    this.pageTitle = this.i18n.fanyi('page.role.add.title');
  }
  goToNextPage(): void {
    sessionStorage.setItem('role-maintenance.role', JSON.stringify(this.currentRole));
    const url = '/auth/role-user?new-role';
    this.router.navigateByUrl(url);
  }
}
