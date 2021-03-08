import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundWaveMaintenanceComponent } from './wave-maintenance.component';

describe('OutboundWaveMaintenanceComponent', () => {
  let component: OutboundWaveMaintenanceComponent;
  let fixture: ComponentFixture<OutboundWaveMaintenanceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundWaveMaintenanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundWaveMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
