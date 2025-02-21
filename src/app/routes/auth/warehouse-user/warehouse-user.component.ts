import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-auth-warehouse-user',
    templateUrl: './warehouse-user.component.html',
    standalone: false
})
export class AuthWarehouseUserComponent implements OnInit {
 

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { 
    console.log(`TO-DO: warehouse access`)
  }

}
