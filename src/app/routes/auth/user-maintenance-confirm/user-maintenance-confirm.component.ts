import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

import { ColumnItem } from '../../util/models/column-item';
import { UtilService } from '../../util/services/util.service';
import { Role } from '../models/role';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
    selector: 'app-auth-user-maintenance-confirm',
    templateUrl: './user-maintenance-confirm.component.html',
    standalone: false
})
export class AuthUserMaintenanceConfirmComponent implements OnInit {
  listOfRoleTableColumns: Array<ColumnItem<Role>> = [
    {
      name: 'name',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => a.name.localeCompare(b.name),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'description',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => a.description.localeCompare(b.description),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [],
      filterFn: null,
      showFilter: false
    },
    {
      name: 'enabled',
      sortOrder: null,
      sortFn: (a: Role, b: Role) => this.utilService.compareBoolean(a.enabled, b.enabled),
      sortDirections: ['ascend', 'descend'],
      filterMultiple: true,
      listOfFilter: [
        { text: this.i18n.fanyi('true'), value: true },
        { text: this.i18n.fanyi('false'), value: false },
      ],
      filterFn: (list: boolean[], role: Role) => list.some(enabled => role.enabled === enabled),
      showFilter: true
    },
  ];

  currentUser!: User;
  pageTitle: string;

  constructor(
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private titleService: TitleService,
    private userService: UserService,
    private router: Router,
    private messageService: NzMessageService,
    private utilService: UtilService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.user.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.user.confirm.title'));
    this.currentUser = JSON.parse(sessionStorage.getItem('user-maintenance.user')!);
  }

  confirm(): void {
    if (this.currentUser!.id) {

      this.userService.changeUser(this.currentUser!).subscribe(userRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => this.goToNextPage(), 500);
      });
    }
    else {

      this.userService.addUser(this.currentUser!).subscribe(userRes => {
        this.messageService.success(this.i18n.fanyi('message.action.success'));
        setTimeout(() => this.goToNextPage(), 500);
      });
    }
  }

  goToNextPage(): void {
    const url = `/auth/user?username=${this.currentUser!.username}`;
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/user/maintenance?new-user');
        break;
      case 1:
        this.router.navigateByUrl('/auth/user-role?new-user');
        break;
      default:
        this.router.navigateByUrl('/auth/user/maintenance?new-user');
        break;
    }
  }
}
