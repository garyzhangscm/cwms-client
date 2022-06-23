import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-alert-web-message-alert',
  templateUrl: './web-message-alert.component.html',
})
export class AlertWebMessageAlertComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
