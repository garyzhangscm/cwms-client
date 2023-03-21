import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';

@Component({
  selector: 'app-integration-integration-data',
  templateUrl: './integration-data.component.html',
  styleUrls: ['./integration-data.component.less'],
})
export class IntegrationIntegrationDataComponent implements OnInit {
  
  displayOnly = false;
  constructor(
    private userService: UserService,) {
    this.displayOnly = userService.isCurrentPageDisplayOnly("/integration/integration-data");
  }

  ngOnInit() {}
}
