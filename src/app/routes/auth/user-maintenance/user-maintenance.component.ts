import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';

import { CompanyService } from '../../warehouse-layout/services/company.service';
import { Department } from '../models/department';
import { User } from '../models/user';
import { WorkerType } from '../models/worker-type';
import { DepartmentService } from '../services/department.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-user-maintenance',
    templateUrl: './user-maintenance.component.html',
    standalone: false
})
export class AuthUserMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN); 
  private readonly companyService = inject(CompanyService);
  currentUser: User | undefined;
  pageTitle = '';
  passwordVisible = false;
  modifying = false;
  validDepartments: Department[] = [];
  workerTypes = WorkerType;
  workerTypesKeys = Object.keys(this.workerTypes);
  isLoginUserAdmin = false;

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
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService, 
    private departmentService: DepartmentService,
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
    this.loadValidDepartments();

    // get the login user. If it is an admin, then we will
    // allow the login user to change the password for others
    this.loadLoginUser();

  }

  loadLoginUser() {
    this.userService.getUsers(this.userService.getCurrentUsername()).subscribe(
      {
        next: (userRes) => this.isLoginUserAdmin = userRes.length == 1 && userRes[0].admin ? true : false 
      }
    )
  }
  loadUsers(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params.hasOwnProperty('userId')) {
        this.userService.getUser(params['userId']).subscribe(userRes => {
          this.modifying = true;
          this.currentUser = userRes;
        });
      } else if (params.hasOwnProperty('new-user')) {
        this.currentUser = JSON.parse(sessionStorage.getItem('user-maintenance.user')!);
      }
    });
  }

  loadValidDepartments(): void {

    this.departmentService.getDepartments().subscribe({
      next: (departmentRes) => this.validDepartments = departmentRes
    })
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
  workerTypeChanged(workerType: WorkerType) : void { 
    this.currentUser!.workerType = workerType;
  }
  departmentChanged(departmentId: number) : void { 
    this.currentUser!.department = this.validDepartments.find(
      department => department.id === departmentId
    );
  }
}
