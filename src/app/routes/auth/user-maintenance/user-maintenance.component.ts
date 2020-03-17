import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';
import { User } from '../models/user';

@Component({
  selector: 'app-auth-user-maintenance',
  templateUrl: './user-maintenance.component.html',
})
export class AuthUserMaintenanceComponent implements OnInit {
  currentUser: User;
  pageTitle: string;
  passwordVisible = false;

  emptyUser: User = {
    id: null,
    password: '',
    username: '',
    firstname: '',
    lastname: '',
    email: '',
    enabled: false,
    locked: false,
    roles: [],
  };

  constructor(
    private router: Router,
    private i18n: I18NService,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadUserFromSessionStorage();
    this.setupPageTitle();
  }

  loadUserFromSessionStorage() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentUser = params.hasOwnProperty('new-user')
        ? sessionStorage.getItem('user-maintenance.user') === null
          ? this.emptyUser
          : JSON.parse(sessionStorage.getItem('user-maintenance.user'))
        : this.emptyUser;
    });
  }

  setupPageTitle() {
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
