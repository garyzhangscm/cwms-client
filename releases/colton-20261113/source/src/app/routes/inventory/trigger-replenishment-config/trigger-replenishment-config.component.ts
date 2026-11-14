import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';

@Component({
    selector: 'app-inventory-trigger-replenishment-config',
    templateUrl: './trigger-replenishment-config.component.html',
    standalone: false
})
export class InventoryTriggerReplenishmentConfigComponent implements OnInit {

  displayOnly = false;
  constructor(private http: _HttpClient,
    private userService: UserService,) {
      userService.isCurrentPageDisplayOnly("/inventory/replenishment/trigger/config").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                 
   }

  ngOnInit() { }

}
