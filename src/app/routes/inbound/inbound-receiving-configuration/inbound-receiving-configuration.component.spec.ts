import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundInboundReceivingConfigurationComponent } from './inbound-receiving-configuration.component';

describe('InboundInboundReceivingConfigurationComponent', () => {
  let component: InboundInboundReceivingConfigurationComponent;
  let fixture: ComponentFixture<InboundInboundReceivingConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundInboundReceivingConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundInboundReceivingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
