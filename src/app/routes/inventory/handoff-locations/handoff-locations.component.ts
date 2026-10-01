import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UserService } from '../../auth/services/user.service';

interface LocationOption {
  id: number;
  name: string;
}

interface HandoffSettings {
  locationIds: number[];
  locations: LocationOption[];
  revision: string;
  warehouseId: number;
}

interface ApiResponse<T> {
  result: number;
  message: string;
  data: T;
}

@Component({
  selector: 'app-inventory-handoff-locations',
  templateUrl: './handoff-locations.component.html',
  styleUrls: ['./handoff-locations.component.less'],
  standalone: false
})
export class HandoffLocationsComponent implements OnInit {
  locations: LocationOption[] = [];
  revision = '';
  loading = false;
  saving = false;
  query = '';
  options: LocationOption[] = [];
  selectedId: number | null = null;
  searching = false;

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
    this.http.get<ApiResponse<HandoffSettings>>('inventory-handoff/locations',
      {headers: this.headers()}).subscribe({
      next: response => {
        this.locations = response.data.locations;
        this.revision = response.data.revision;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to load handoff locations');
        this.loading = false;
      }
    });
  }

  search(): void {
    const query = this.query.trim();
    if (!/^[A-Za-z0-9_. -]{2,40}$/.test(query)) {
      this.messages.error('Enter 2–40 characters of a location name');
      return;
    }
    this.searching = true;
    this.selectedId = null;
    this.http.get<ApiResponse<LocationOption[]>>('inventory-handoff/location-options',
      {headers: this.headers(), params: {q: query}}).subscribe({
      next: response => {
        this.options = response.data;
        this.searching = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to search MES locations');
        this.searching = false;
      }
    });
  }

  isSelected(id: number): boolean {
    return this.locations.some(location => location.id === id);
  }

  add(): void {
    const location = this.options.find(option => option.id === this.selectedId);
    if (!location || this.isSelected(location.id)) return;
    if (this.locations.length >= 20) {
      this.messages.error('Select at most 20 locations');
      return;
    }
    this.locations = [...this.locations, location];
    this.selectedId = null;
  }

  remove(id: number): void {
    this.locations = this.locations.filter(location => location.id !== id);
  }

  save(): void {
    this.saving = true;
    this.http.put<ApiResponse<HandoffSettings>>('inventory-handoff/locations',
      {locationIds: this.locations.map(location => location.id), revision: this.revision},
      {headers: this.headers()}).subscribe({
      next: response => {
        this.locations = response.data.locations;
        this.revision = response.data.revision;
        this.messages.success('Handoff locations saved');
        this.saving = false;
      },
      error: (error: HttpErrorResponse) => {
        this.messages.error(error.error?.message || 'Unable to save handoff locations');
        this.saving = false;
      }
    });
  }
}
