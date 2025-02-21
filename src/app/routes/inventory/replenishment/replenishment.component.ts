import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';

@Component({
    selector: 'app-inventory-replenishment',
    templateUrl: './replenishment.component.html',
    standalone: false
})
export class InventoryReplenishmentComponent implements OnInit {

  displayOnly = false;
  constructor(private http: _HttpClient,
    private userService: UserService,) {
      userService.isCurrentPageDisplayOnly("/inventory/replenishment").then(
        displayOnlyFlag => this.displayOnly = displayOnlyFlag
      );                
     
   }

  ngOnInit() { }

}
