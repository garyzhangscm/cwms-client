import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransportationTractorAppointmentMaintenanceComponent } from './tractor-appointment-maintenance.component';

describe('TransportationTractorAppointmentMaintenanceComponent', () => {
  let component: TransportationTractorAppointmentMaintenanceComponent;
  let fixture: ComponentFixture<TransportationTractorAppointmentMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationTractorAppointmentMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationTractorAppointmentMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
