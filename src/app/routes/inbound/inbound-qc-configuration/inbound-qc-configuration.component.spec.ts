import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { InboundInboundQcConfigurationComponent } from './inbound-qc-configuration.component';

describe('InboundInboundQcConfigurationComponent', () => {
  let component: InboundInboundQcConfigurationComponent;
  let fixture: ComponentFixture<InboundInboundQcConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundInboundQcConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundInboundQcConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
