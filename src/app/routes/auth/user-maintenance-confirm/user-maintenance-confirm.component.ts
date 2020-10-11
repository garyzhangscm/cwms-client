import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-auth-user-maintenance-confirm',
  templateUrl: './user-maintenance-confirm.component.html',
})
export class AuthUserMaintenanceConfirmComponent implements OnInit {
  currentUser: User | undefined;
  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private userService: UserService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.user.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.user.confirm.title'));
    this.currentUser = JSON.parse(sessionStorage.getItem('user-maintenance.user')!);
  }

  confirm(): void {
    this.userService.addUser(this.currentUser!).subscribe(userRes => {
      this.messageService.success(this.i18n.fanyi('message.action.success'));
      setTimeout(() => this.goToNextPage(), 2000);
    });
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
