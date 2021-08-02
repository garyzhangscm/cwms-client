import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth-user-maintenance',
  templateUrl: './user-maintenance.component.html',
})
export class AuthUserMaintenanceComponent implements OnInit {
  currentUser: User | undefined;
  pageTitle = '';
  passwordVisible = false;
  modifying = false;

  emptyUser: User = {
    id: undefined,
    companyId: this.companyService.getCurrentCompany()?.id,
    password: '',
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    enabled: false,
    locked: false,
    roles: [],
    changePasswordAtNextLogon: false,
    workingTeams: [],
  };

  constructor(
    private router: Router,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private companyService: CompanyService,
  ) { }

  ngOnInit(): void {
    this.currentUser = this.emptyUser;
    // When we pass in a userId and can find an user
    // by the id, then we are in modify mode and will
    // disable the 'username' field so that to disallow
    // changing of username. otherwise, we are in creating
    // mode which will create a new user
    this.modifying = false;
    this.loadUsers();
    this.setupPageTitle();

    this.activatedRoute.queryParams.subscribe(params => { });
  }

  loadUsers(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('userId')) {
        this.userService.getUser(params.userId).subscribe(userRes => {
          this.modifying = true;
          this.currentUser = userRes;
        });
      } else if (params.hasOwnProperty('new-user')) {
        this.currentUser = JSON.parse(sessionStorage.getItem('user-maintenance.user')!);
      }
    });
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.user.add.title'));
    this.pageTitle = this.i18n.fanyi('page.user.add.title');
  }
  goToNextPage(): void {
    sessionStorage.setItem('user-maintenance.user', JSON.stringify(this.currentUser));
    // console.log(`this.currentUser:${this.currentUser}`);
    const url = '/auth/user-role?new-user';
    this.router.navigateByUrl(url);
  }
}
