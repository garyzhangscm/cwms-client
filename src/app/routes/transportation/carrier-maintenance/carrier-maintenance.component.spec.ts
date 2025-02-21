import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TransportationCarrierMaintenanceComponent } from './carrier-maintenance.component';

describe('TransportationCarrierMaintenanceComponent', () => {
  let component: TransportationCarrierMaintenanceComponent;
  let fixture: ComponentFixture<TransportationCarrierMaintenanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransportationCarrierMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransportationCarrierMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
