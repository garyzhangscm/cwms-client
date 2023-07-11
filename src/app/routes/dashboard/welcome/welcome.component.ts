import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-dashboard-welcome',
  templateUrl: './welcome.component.html',
})
export class DashboardWelcomeComponent implements OnInit {

  openOrders: number = 137;
  newOrdersToday: number = 854;
  completedOrdersToday: number = 717;
  openReceipt: number = 6;

  totalPicks: number = 2690;
  openPicks: number = 776;
  completedPicks: number = 1914;
  stagedPicks: number = 1901;


  picksByLocationGroup: Map<String, number> = new Map<String, number>(); 

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { 
    this.picksByLocationGroup.set("PickingFace001", 50);
    this.picksByLocationGroup.set("PickingFace002", 37);
    this.picksByLocationGroup.set("BulkStorage", 3);
    this.picksByLocationGroup.set("FrozenZone", 18);
  }

}
