import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-common-trailer-container',
  templateUrl: './trailer-container.component.html',
})
export class CommonTrailerContainerComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
