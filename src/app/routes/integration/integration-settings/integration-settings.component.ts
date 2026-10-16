import { inject as injectWebI18n } from '@angular/core';
import { I18NService as WebI18nService } from '@core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';

interface ItemTypeSettings {
  mapping: Record<string, string>;
  revision: string;
  families: string[];
}

interface SettingsResponse {
  result: number;
  message: string;
  data: ItemTypeSettings;
}

interface MappingRow {
  code: string;
  family: string;
}

@Component({
  selector: 'app-integration-settings',
  templateUrl: './integration-settings.component.html',
  styleUrls: ['./integration-settings.component.less'],
  standalone: false
})
export class IntegrationSettingsComponent implements OnInit {
  private readonly webI18n = injectWebI18n(WebI18nService);
  rows: MappingRow[] = [];
  families: string[] = [];
  revision = '';
  loading = false;
  saving = false;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private messages: NzMessageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({'X-CWMS-Username': this.userService.getCurrentUsername()});
  }

  load(): void {
    this.loading = true;
    this.http.get<SettingsResponse>('integration-settings/item-types', {headers: this.headers()}).subscribe({
      next: response => {
        this.rows = Object.entries(response.data.mapping).map(([code, family]) => ({code, family}));
        this.families = response.data.families;
        this.revision = response.data.revision;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to load integration settings');
        this.loading = false;
      }
    });
  }

  addRow(): void {
    this.rows = [...this.rows, {code: '', family: ''}];
  }

  removeRow(index: number): void {
    this.rows = this.rows.filter((_, rowIndex) => rowIndex !== index);
  }

  save(): void {
    const mapping: Record<string, string> = {};
    for (const row of this.rows) {
      const code = row.code.trim();
      if (!/^[A-Za-z0-9_-]{1,20}$/.test(code)) {
        this.messages.error(this.webI18n.fanyi('web.message.1f0ae0c62cf3'));
        return;
      }
      if (Object.prototype.hasOwnProperty.call(mapping, code)) {
        this.messages.error(this.webI18n.fanyi('web.message.34da08e54af5', { p0: code }));
        return;
      }
      if (!this.families.includes(row.family)) {
        this.messages.error(this.webI18n.fanyi('web.message.d4274d514034', { p0: code }));
        return;
      }
      mapping[code] = row.family;
    }
    if (this.rows.length === 0) {
      this.messages.error(this.webI18n.fanyi('web.message.256f9d03031b'));
      return;
    }
    this.saving = true;
    this.http.put<SettingsResponse>('integration-settings/item-types',
      {mapping, revision: this.revision}, {headers: this.headers()}).subscribe({
      next: response => {
        this.rows = Object.entries(response.data.mapping).map(([code, family]) => ({code, family}));
        this.families = response.data.families;
        this.revision = response.data.revision;
        this.messages.success(this.webI18n.fanyi('web.message.331a9eff416b'));
        this.saving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to save integration settings');
        this.saving = false;
      }
    });
  }
}
