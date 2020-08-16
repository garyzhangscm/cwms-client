import { Component, OnInit } from '@angular/core';
import { _HttpClient, TitleService } from '@delon/theme';
import { WorkingTeam } from '../models/working-team';
import { Router, ActivatedRoute } from '@angular/router';
import { I18NService } from '@core';

@Component({
  selector: 'app-auth-working-team-maintenance',
  templateUrl: './working-team-maintenance.component.html',
})
export class AuthWorkingTeamMaintenanceComponent implements OnInit {
  currentWorkingTeam: WorkingTeam;
  pageTitle: string;

  emptyWorkingTeam: WorkingTeam = {
    id: 0,
    name: '',
    description: '',
    enabled: true,
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
      this.currentWorkingTeam = params.hasOwnProperty('new-working-team')
        ? sessionStorage.getItem('working-team-maintenance.working-team') === null
          ? this.emptyWorkingTeam
          : JSON.parse(sessionStorage.getItem('working-team-maintenance.working-team'))
        : this.emptyWorkingTeam;
    });
  }

  setupPageTitle() {
    this.titleService.setTitle(this.i18n.fanyi('page.working-team.add.title'));
    this.pageTitle = this.i18n.fanyi('page.working-team.add.title');
  }
  goToNextPage(): void {
    sessionStorage.setItem('working-team-maintenance.working-team', JSON.stringify(this.currentWorkingTeam));
    const url = '/auth/working-team/user?new-working-team';
    this.router.navigateByUrl(url);
  }
}
