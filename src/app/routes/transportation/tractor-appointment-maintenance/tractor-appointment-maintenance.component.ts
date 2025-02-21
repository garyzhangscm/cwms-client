import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
    selector: 'app-transportation-tractor-appointment-maintenance',
    templateUrl: './tractor-appointment-maintenance.component.html',
    standalone: false
})
export class TransportationTractorAppointmentMaintenanceComponent implements OnInit {

  constructor(private http: _HttpClient) { }

  ngOnInit(): void { }

}
