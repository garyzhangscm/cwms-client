import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance.component';

describe('InboundPutawayConfigurationMaintenanceComponent', () => {
  let component: InboundPutawayConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<InboundPutawayConfigurationMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPutawayConfigurationMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPutawayConfigurationMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
