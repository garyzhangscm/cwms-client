import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { UserService } from '../../auth/services/user.service';

@Component({
  selector: 'app-inventory-replenishment',
  templateUrl: './replenishment.component.html',
})
export class InventoryReplenishmentComponent implements OnInit {

  displayOnly = false;
  constructor(private http: _HttpClient,
    private userService: UserService,) {
    this.displayOnly = userService.isCurrentPageDisplayOnly("/inventory/replenishment");
   }

  ngOnInit() { }

}
