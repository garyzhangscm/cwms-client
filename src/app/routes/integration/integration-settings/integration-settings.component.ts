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
        this.messages.error('Enter an Item Type code of 1–20 letters, numbers, _ or -');
        return;
      }
      if (Object.prototype.hasOwnProperty.call(mapping, code)) {
        this.messages.error(`Item Type ${code} is entered more than once`);
        return;
      }
      if (!this.families.includes(row.family)) {
        this.messages.error(`Select an existing MES Item Family for ${code}`);
        return;
      }
      mapping[code] = row.family;
    }
    if (this.rows.length === 0) {
      this.messages.error('Add at least one Item Type mapping');
      return;
    }
    this.saving = true;
    this.http.put<SettingsResponse>('integration-settings/item-types',
      {mapping, revision: this.revision}, {headers: this.headers()}).subscribe({
      next: response => {
        this.rows = Object.entries(response.data.mapping).map(([code, family]) => ({code, family}));
        this.families = response.data.families;
        this.revision = response.data.revision;
        this.messages.success('Integration settings saved');
        this.saving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to save integration settings');
        this.saving = false;
      }
    });
  }
}
