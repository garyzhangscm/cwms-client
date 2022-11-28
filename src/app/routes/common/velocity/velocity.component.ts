import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-velocity',
  templateUrl: './velocity.component.html',
})
export class CommonVelocityComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
