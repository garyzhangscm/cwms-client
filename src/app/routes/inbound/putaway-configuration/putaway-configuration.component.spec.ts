import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InboundPutawayConfigurationComponent } from './putaway-configuration.component';

describe('InboundPutawayConfigurationComponent', () => {
  let component: InboundPutawayConfigurationComponent;
  let fixture: ComponentFixture<InboundPutawayConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InboundPutawayConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InboundPutawayConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
