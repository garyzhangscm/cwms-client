import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-inbound-putaway-configuration-confim',
    templateUrl: './putaway-configuration-confim.component.html',
    standalone: false
})
export class InboundPutawayConfigurationConfimComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit() { }

}
