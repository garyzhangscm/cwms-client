import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OutboundOrderMaintenanceComponent } from './order-maintenance.component';

describe('OutboundOrderMaintenanceComponent', () => {
  let component: OutboundOrderMaintenanceComponent;
  let fixture: ComponentFixture<OutboundOrderMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOrderMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOrderMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
