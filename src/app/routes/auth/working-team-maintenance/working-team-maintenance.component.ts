import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { I18NService } from '@core';
import { ALAIN_I18N_TOKEN, TitleService, _HttpClient } from '@delon/theme';
import { WorkingTeam } from '../models/working-team';

@Component({
    selector: 'app-auth-working-team-maintenance',
    templateUrl: './working-team-maintenance.component.html',
    standalone: false
})
export class AuthWorkingTeamMaintenanceComponent implements OnInit {
  private readonly i18n = inject<I18NService>(ALAIN_I18N_TOKEN);
  currentWorkingTeam!: WorkingTeam;
  pageTitle = '';

  emptyWorkingTeam: WorkingTeam = {
    id: 0,
    name: '',
    description: '',
    enabled: true,
    users: [],
  };

  constructor(
    private router: Router,
    private titleService: TitleService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.loadRoleFromSessionStorage();
    this.setupPageTitle();
  }

  loadRoleFromSessionStorage(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.currentWorkingTeam = params.hasOwnProperty('new-working-team')
        ? sessionStorage.getItem('working-team-maintenance.working-team') === null
          ? this.emptyWorkingTeam
          : JSON.parse(sessionStorage.getItem('working-team-maintenance.working-team')!)
        : this.emptyWorkingTeam;
    });
  }

  setupPageTitle(): void {
    this.titleService.setTitle(this.i18n.fanyi('page.working-team.add.title'));
    this.pageTitle = this.i18n.fanyi('page.working-team.add.title');
  }
  goToNextPage(): void {
    sessionStorage.setItem('working-team-maintenance.working-team', JSON.stringify(this.currentWorkingTeam));
    const url = '/auth/working-team/user?new-working-team';
    this.router.navigateByUrl(url);
  }
}
