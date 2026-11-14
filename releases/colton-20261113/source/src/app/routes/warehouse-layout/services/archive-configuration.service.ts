import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { Observable, map } from 'rxjs';

import { ArchiveConfiguration } from '../models/archive-configuration';
import { WarehouseService } from './warehouse.service';

@Injectable({
  providedIn: 'root'
})
export class ArchiveConfigurationService {

  constructor(private http: _HttpClient, 
    private warehouseService: WarehouseService,  
    ) {}

  getArchiveConfiguration(): Observable<ArchiveConfiguration> { 
  
    return this.http
      .get(`resource/archive-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`)
      .pipe(map(res => res.data));

  }
   
  addArchiveConfiguration(archiveConfiguration: ArchiveConfiguration): Observable<ArchiveConfiguration> { 

    let url = `resource/archive-configuration?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.put(url, archiveConfiguration)
      .pipe(map(res => res.data));
  }

  changeArchiveConfiguration(archiveConfiguration: ArchiveConfiguration): Observable<ArchiveConfiguration> { 

    let url = `resource/archive-configuration/${archiveConfiguration.id}?warehouseId=${this.warehouseService.getCurrentWarehouse().id}`;
      
    return this.http.post(url, archiveConfiguration)
      .pipe(map(res => res.data));
  }
}
