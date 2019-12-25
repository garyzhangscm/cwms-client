import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundPutawayConfigurationMaintenanceComponent } from './putaway-configuration-maintenance.component';

describe('InboundPutawayConfigurationMaintenanceComponent', () => {
  let component: InboundPutawayConfigurationMaintenanceComponent;
  let fixture: ComponentFixture<InboundPutawayConfigurationMaintenanceComponent>;

  beforeEach(async(() => {
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
