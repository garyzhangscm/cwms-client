import { Component, OnInit, ViewChild } from '@angular/core';
import { STComponent, STColumn } from '@delon/abc/st';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';

import { UserService } from '../../auth/services/user.service';
import { CompanyService } from '../../warehouse-layout/services/company.service';
import { WebMessageAlert } from '../models/web-message-alert';

@Component({
  selector: 'app-alert-web-message-alert',
  templateUrl: './web-message-alert.component.html',
})
export class AlertWebMessageAlertComponent implements OnInit {

  isSpinning = false; 
  constructor(private http: _HttpClient, private companySerive: CompanyService, 
    private userService: UserService) { }

  ngOnInit(): void { 
    
  }

  url = `${environment.api.baseUrl}resource/web-message-alerts`;
  params = { companyId: this.companySerive.getCurrentCompany()!.id, 
    username: this.userService.getCurrentUsername()};
    
  @ViewChild('st', { static: false }) private st!: STComponent;
  columns: STColumn[] = [
    { title: 'id', index: 'id', width: 80 }, 
    { title: 'title', index: 'alert.title', width: 80 },
    { title: 'message', index: 'alert.message' },
  ];

}
