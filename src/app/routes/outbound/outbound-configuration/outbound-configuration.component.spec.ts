import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { OutboundOutboundConfigurationComponent } from './outbound-configuration.component';

describe('OutboundOutboundConfigurationComponent', () => {
  let component: OutboundOutboundConfigurationComponent;
  let fixture: ComponentFixture<OutboundOutboundConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OutboundOutboundConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutboundOutboundConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
