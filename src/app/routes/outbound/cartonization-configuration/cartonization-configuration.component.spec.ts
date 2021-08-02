import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { OutboundCartonizationConfigurationComponent } from './cartonization-configuration.component';

describe('OutboundCartonizationConfigurationComponent', () => {
  let component: OutboundCartonizationConfigurationComponent;
  let fixture: ComponentFixture<OutboundCartonizationConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundCartonizationConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundCartonizationConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
