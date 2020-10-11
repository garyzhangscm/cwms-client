import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { I18NService } from '@core';
import { TitleService, _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';
import { WorkingTeam } from '../models/working-team';
import { WorkingTeamService } from '../services/working-team.service';

@Component({
  selector: 'app-auth-working-team-maintenance-confirm',
  templateUrl: './working-team-maintenance-confirm.component.html',
})
export class AuthWorkingTeamMaintenanceConfirmComponent implements OnInit {
  currentWorkingTeam: WorkingTeam | undefined;
  pageTitle: string;

  constructor(
    private i18n: I18NService,
    private titleService: TitleService,
    private workingTeamService: WorkingTeamService,
    private router: Router,
    private messageService: NzMessageService,
  ) {
    this.pageTitle = this.i18n.fanyi('page.working-team.confirm.title');
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.working-team.confirm.title'));
    this.currentWorkingTeam = JSON.parse(sessionStorage.getItem('working-team-maintenance.working-team')!);
  }

  confirm(): void {
    this.workingTeamService.addWorkingTeam(this.currentWorkingTeam!).subscribe(workingTeamRes => {
      this.messageService.success(this.i18n.fanyi('message.new.complete'));
      setTimeout(() => this.goToNextPage(), 2000);
    });
  }

  goToNextPage(): void {
    const url = `/auth/working-team?name=${this.currentWorkingTeam!.name}`;
    this.router.navigateByUrl(url);
  }

  onStepsIndexChange(index: number): void {
    switch (index) {
      case 0:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-working-team');
        break;
      case 1:
        this.router.navigateByUrl('/auth/working-team-user?new-working-team');
        break;
      default:
        this.router.navigateByUrl('/auth/working-team/maintenance?new-role');
        break;
    }
  }
}
