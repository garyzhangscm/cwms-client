import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundGridMaintenanceComponent } from './grid-maintenance.component';

describe('OutboundGridMaintenanceComponent', () => {
  let component: OutboundGridMaintenanceComponent;
  let fixture: ComponentFixture<OutboundGridMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundGridMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundGridMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
