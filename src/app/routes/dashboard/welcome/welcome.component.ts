import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-dashboard-welcome',
  templateUrl: './welcome.component.html',
})
export class DashboardWelcomeComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
