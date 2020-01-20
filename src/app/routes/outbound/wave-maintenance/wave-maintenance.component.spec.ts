import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundWaveMaintenanceComponent } from './wave-maintenance.component';

describe('OutboundWaveMaintenanceComponent', () => {
  let component: OutboundWaveMaintenanceComponent;
  let fixture: ComponentFixture<OutboundWaveMaintenanceComponent>;

  beforeEach(async(() => {
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
