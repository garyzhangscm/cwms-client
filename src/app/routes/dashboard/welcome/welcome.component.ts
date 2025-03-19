import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

import { OrderService } from '../../outbound/services/order.service';
import { PickService } from '../../outbound/services/pick.service';

@Component({
    selector: 'app-dashboard-welcome',
    templateUrl: './welcome.component.html',
    standalone: false
})
export class DashboardWelcomeComponent implements OnInit {

  openOrders: number = 0;
  newOrdersToday: number = 0;
  completedOrdersToday: number = 0;
  openReceipt: number = 0;

  totalPicks: number = 0;
  openPicks: number = 0;
  completedPicks: number = 0;
  // stagedPicks: number = 0;

  loadingPickCount = false;
  loadingPickByLocationGroupCount = false;


  picksByLocationGroup: Map<String, number[]> = new Map<String, number[]>(); 

  constructor(private http: _HttpClient, 
    private orderService: OrderService, 
    private pickService: PickService) { }

  ngOnInit(): void { 
    this.orderService.getOpenOrderCount().subscribe({
      next: (count) => this.openOrders = count
    });
    this.orderService.getTodayOrderCount().subscribe({
      next: (count) => this.newOrdersToday = count
    });
    this.orderService.getTodayCompletedOrderCount().subscribe({
      next: (count) => this.completedOrdersToday = count
    });
    /**
     * 
    this.loadingPickCount = true;
    this.pickService.getOpenPickCount().subscribe({
      next: (openPickCount) => {
        this.openPicks = openPickCount;
        this.pickService.getCompletedPickCount().subscribe({
          next: (completedPickCount) => {
            this.completedPicks = completedPickCount;
            this.totalPicks =  this.openPicks + this.completedPicks ;
            this.loadingPickCount = false;
          }, 
          error: () => this.loadingPickCount = false
        });
      }, 
      error: () => this.loadingPickCount = false
    });
     * 
     */

    /**
     * This endpoint may have performance issue. We disabled at this moment
     * until we fix it 
     * 
    this.pickService.getPickCountByLocationGroup().subscribe({
      next: (pickByLocationGroupRes) => {
        this.picksByLocationGroup = pickByLocationGroupRes;
      }
    })
     */
  }

}
