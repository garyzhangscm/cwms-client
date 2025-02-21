import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-work-order-work-order-complete-by-product',
    templateUrl: './work-order-complete-by-product.component.html',
    standalone: false
})
export class WorkOrderWorkOrderCompleteByProductComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
